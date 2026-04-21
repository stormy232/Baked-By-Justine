<?php
/**
 * api/create_checkout_session.php
 * 
 * Creator: Ridwan Moalim
 * The purpose of this php file is to checkout the client using stripe api
 * 
 * POST - creates a Stripe Checkout Session and returns the redirect URL.
 *
 * Does NOT require Composer. Uses Stripe's REST API directly via cURL.
 *
 * Body: { "customer_email": "jane@email.com", "est_prep_time": "20-30 minutes" }
 *
 * Response: { "url": "https://checkout.stripe.com/pay/cs_xxx" }
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

define('STRIPE_SECRET_KEY', 'sk_test_51TON2fBBWdF3bohJFUvIXrIb5fdGv5CIolRkzP6SMiilnPWzlw0RODVJqKxpGKLQgJ7a9q3V4jsMqYIjT3GPM2ge00WQlDJiWZ');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body    = json_decode(file_get_contents('php://input'), true);
$email   = isset($body['customer_email']) ? trim($body['customer_email']) : '';
$prepTime = isset($body['est_prep_time'])  ? trim($body['est_prep_time'])  : '20-30 minutes';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid customer_email is required']);
    exit;
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare(
        "SELECT c.product_id, c.qty, p.name, p.price, p.discount_percent
         FROM cart c
         JOIN products p ON p.product_id = c.product_id
         WHERE c.customer_email = ?"
    );
    $stmt->execute([$email]);
    $rows = $stmt->fetchAll();

    if (empty($rows)) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart is empty']);
        exit;
    }

    // Build Stripe line_items array
    $lineItems = [];
    foreach ($rows as $row) {
        $price     = (float)$row['price'];
        $disc      = (float)$row['discount_percent'];
        $final     = $disc > 0 ? $price * (1 - $disc / 100) : $price;
        $unitCents = (int)round($final * 100);

        $lineItems[] = [
            'price_data' => [
                'currency'     => 'cad',
                'unit_amount'  => $unitCents,
                'product_data' => [
                    'name' => $row['name'],
                ],
            ],
            'quantity' => (int)$row['qty'],
        ];
    }

    // Build the success URL — passes email and prep time back so confirm page can use them
    $baseUrl    = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
    $projectDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
    $successUrl = $baseUrl . $projectDir . '/confirm.html?session_id={CHECKOUT_SESSION_ID}&email=' . urlencode($email) . '&prep=' . urlencode($prepTime);
    $cancelUrl  = $baseUrl . $projectDir . '/order.html';

    // Build POST data for Stripe API using cURL (no Composer needed)
    $postData = 'customer_email=' . urlencode($email);
    $postData .= '&mode=payment';
    $postData .= '&success_url=' . urlencode($successUrl);
    $postData .= '&cancel_url='  . urlencode($cancelUrl);

    foreach ($lineItems as $i => $item) {
        $postData .= '&line_items[' . $i . '][price_data][currency]=cad';
        $postData .= '&line_items[' . $i . '][price_data][unit_amount]=' . $item['price_data']['unit_amount'];
        $postData .= '&line_items[' . $i . '][price_data][product_data][name]=' . urlencode($item['price_data']['product_data']['name']);
        $postData .= '&line_items[' . $i . '][quantity]=' . $item['quantity'];
    }

    // Also store prep_time in metadata so submit_order.php can use it
    $postData .= '&metadata[customer_email]=' . urlencode($email);
    $postData .= '&metadata[est_prep_time]='  . urlencode($prepTime);

    $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     $postData);
    curl_setopt($ch, CURLOPT_USERPWD,        STRIPE_SECRET_KEY . ':');
    curl_setopt($ch, CURLOPT_HTTPHEADER,     ['Content-Type: application/x-www-form-urlencoded']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($httpCode !== 200 || !isset($data['url'])) {
        http_response_code(500);
        echo json_encode(['error' => isset($data['error']['message']) ? $data['error']['message'] : 'Stripe error']);
        exit;
    }

    echo json_encode(['url' => $data['url']]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

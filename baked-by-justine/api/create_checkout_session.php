<?php
/**
 * api/create_checkout_session.php
 * 
 * Creator: Ridwan Moalim
 * The purpose of this php file is to checkout the client using stripe api
 * POST - creates a Stripe Checkout Session and returns the redirect URL.
 *
 * Uses file_get_contents instead of cURL for compatibility with restricted servers.
 *

 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

define('STRIPE_SECRET_KEY', 'sk_test_51TON2fBBWdF3bohJFUvIXrIb5fdGv5CIolRkzP6SMiilnPWzlw0RODVJqKxpGKLQgJ7a9q3V4jsMqYIjT3GPM2ge00WQlDJiWZ');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$email    = isset($body['customer_email']) ? trim($body['customer_email']) : '';
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

    // Build POST data for Stripe API
    $postData = 'customer_email=' . urlencode($email);
    $postData .= '&mode=payment';

    $baseUrl    = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
    $projectDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
    $successUrl = $baseUrl . $projectDir . '/confirm.html?session_id={CHECKOUT_SESSION_ID}&email=' . urlencode($email) . '&prep=' . urlencode($prepTime);
    $cancelUrl  = $baseUrl . $projectDir . '/order.html';

    $postData .= '&success_url=' . urlencode($successUrl);
    $postData .= '&cancel_url='  . urlencode($cancelUrl);

    $i = 0;
    foreach ($rows as $row) {
        $price     = (float)$row['price'];
        $disc      = (float)$row['discount_percent'];
        $final     = $disc > 0 ? $price * (1 - $disc / 100) : $price;
        $unitCents = (int)round($final * 100);

        $postData .= '&line_items[' . $i . '][price_data][currency]=cad';
        $postData .= '&line_items[' . $i . '][price_data][unit_amount]=' . $unitCents;
        $postData .= '&line_items[' . $i . '][price_data][product_data][name]=' . urlencode($row['name']);
        $postData .= '&line_items[' . $i . '][quantity]=' . (int)$row['qty'];
        $i++;
    }

    $postData .= '&metadata[customer_email]=' . urlencode($email);
    $postData .= '&metadata[est_prep_time]='  . urlencode($prepTime);

    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => implode("\r\n", [
                'Content-Type: application/x-www-form-urlencoded',
                'Authorization: Basic ' . base64_encode(STRIPE_SECRET_KEY . ':'),
                'Content-Length: ' . strlen($postData),
            ]),
            'content'         => $postData,
            'ignore_errors'   => true,
        ]
    ]);

    $response = file_get_contents('https://api.stripe.com/v1/checkout/sessions', false, $context);

    if ($response === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not reach Stripe API']);
        exit;
    }

    $data     = json_decode($response, true);
    $httpCode = 200;

    foreach ($http_response_header as $header) {
        if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
            $httpCode = (int)$matches[1];
        }
    }

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

<?php

 
//  Creator: Ridwan Moalim
//  api/create_payment_intent.php
//  POST - creates a Stripe PaymentIntent for the cart total.
//  


require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');

define('STRIPE_SECRET_KEY', 'sk_test_YOUR_KEY_HERE');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body  = json_decode(file_get_contents('php://input'), true);
$email = isset($body['customer_email']) ? trim($body['customer_email']) : '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid customer_email is required']);
    exit;
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare(
        "SELECT c.qty, p.price, p.discount_percent
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

    $total = 0;
    foreach ($rows as $row) {
        $price = (float)$row['price'];
        $disc  = (float)$row['discount_percent'];
        $final = $disc > 0 ? $price * (1 - $disc / 100) : $price;
        $total += $final * (int)$row['qty'];
    }

    $amountCents = (int)round($total * 100);

    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

    $intent = \Stripe\PaymentIntent::create([
        'amount'   => $amountCents,
        'currency' => 'cad',
        'metadata' => ['customer_email' => $email],
    ]);
echo json_encode(['clientSecret' => $intent->client_secret]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Stripe error: ' . $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
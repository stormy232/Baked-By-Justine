<?php
/**
 * 
 * api/submit_order.php
 * POST - reads the customer's cart, inserts into delivery + order_items,
 *        decrements product stock, then clears their cart rows.
 *        All DB writes are inside one transaction so nothing half-saves.
 *
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$email    = isset($body['customer_email']) ? trim($body['customer_email']) : '';
$prepTime = isset($body['est_prep_time'])  ? trim($body['est_prep_time'])  : '20-30 minutes';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid customer_email is required']);
    exit;
}

try {
    $pdo = getDB();

    // Fetch cart joined with current product prices and stock
    $stmt = $pdo->prepare(
        "SELECT c.product_id, c.qty,
                p.price, p.discount_percent, p.quantity AS stock, p.name
         FROM   cart c
         JOIN   products p ON p.product_id = c.product_id
         WHERE  c.customer_email = ?"
    );
    $stmt->execute([$email]);
    $cartRows = $stmt->fetchAll();

    if (empty($cartRows)) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart is empty']);
        exit;
    }

    // Verify stock is still available for every item before touching anything
    foreach ($cartRows as $row) {
        if ((int)$row['qty'] > (int)$row['stock']) {
            http_response_code(409);
            echo json_encode([
                'error'     => $row['name'] . ' only has ' . $row['stock'] . ' left in stock',
                'product_id'=> (int)$row['product_id'],
                'available' => (int)$row['stock'],
            ]);
            exit;
        }
    }

    // Calculate total (discounted price * qty per item)
    $total = 0;
    foreach ($cartRows as $row) {
        $price = (float)$row['price'];
        $disc  = (float)$row['discount_percent'];
        $final = $disc > 0 ? $price * (1 - $disc / 100) : $price;
        $total += $final * (int)$row['qty'];
    }

    $pdo->beginTransaction();

    // 1. Insert delivery header
    $ins = $pdo->prepare(
        "INSERT INTO delivery (customer_email, order_status, est_prep_time, total_price)
         VALUES (?, 'pending', ?, ?)"
    );
    $ins->execute([$email, $prepTime, round($total, 2)]);
    $orderId = (int)$pdo->lastInsertId();

    // 2. Insert order_items + decrement stock for each product
    $itemStmt = $pdo->prepare(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)"
    );
    $stockStmt = $pdo->prepare(
        "UPDATE products
         SET    quantity = quantity - ?
         WHERE  product_id = ?
         AND    quantity >= ?"
    );

    foreach ($cartRows as $row) {
        $price     = (float)$row['price'];
        $disc      = (float)$row['discount_percent'];
        $final     = $disc > 0 ? $price * (1 - $disc / 100) : $price;
        $productId = (int)$row['product_id'];
        $qty       = (int)$row['qty'];

        $itemStmt->execute([$orderId, $productId, $qty, round($final, 2)]);

        // Decrement stock — the AND quantity >= ? guard prevents going below 0
        $stockStmt->execute([$qty, $productId, $qty]);

        if ($stockStmt->rowCount() === 0) {
            // Another order beat us to it — roll back everything
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => $row['name'] . ' just went out of stock. Please update your cart.']);
            exit;
        }
    }

    // 3. Clear the customer's cart
    $del = $pdo->prepare("DELETE FROM cart WHERE customer_email = ?");
    $del->execute([$email]);

    $pdo->commit();

    // Fetch created_at from the new order row
    $ts    = $pdo->prepare("SELECT created_at FROM delivery WHERE order_id = ?");
    $ts->execute([$orderId]);
    $tsRow = $ts->fetch();

    echo json_encode([
        'success'    => true,
        'order_id'   => $orderId,
        'total'      => round($total, 2),
        'created_at' => $tsRow ? $tsRow['created_at'] : date('Y-m-d H:i:s'),
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

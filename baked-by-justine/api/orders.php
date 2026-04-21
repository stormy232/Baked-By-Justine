<?php
/**
 * api/orders.php
 * GET ?customer_email=x  -> returns all orders for this email, newest first,
 *                           with items nested inside each order.
 * 
 * Creator: Ridwan Moalim
 * The purpose of this file is to handle order tracking on order.html
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$email = isset($_GET['customer_email']) ? trim($_GET['customer_email']) : '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'A valid email is required']);
    exit;
}

try {
    $pdo = getDB();

    $orderStmt = $pdo->prepare(
        "SELECT order_id, order_status, est_prep_time, total_price, created_at
         FROM   delivery
         WHERE  customer_email = ?
         ORDER  BY created_at DESC"
    );
    $orderStmt->execute([$email]);
    $orders = $orderStmt->fetchAll();

    if (empty($orders)) {
        echo json_encode([]);
        exit;
    }

    $orderIds     = array_map(function($o) { return (int)$o['order_id']; }, $orders);
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));

    $itemStmt = $pdo->prepare(
        "SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name
         FROM   order_items oi
         JOIN   products p ON p.product_id = oi.product_id
         WHERE  oi.order_id IN ($placeholders)"
    );
    $itemStmt->execute($orderIds);
    $allItems = $itemStmt->fetchAll();

    $itemsByOrder = [];
    foreach ($allItems as $item) {
        $oid = (int)$item['order_id'];
        if (!isset($itemsByOrder[$oid])) $itemsByOrder[$oid] = [];
        $itemsByOrder[$oid][] = [
            'product_id'        => (int)   $item['product_id'],
            'name'              => $item['name'],
            'quantity'          => (int)   $item['quantity'],
            'price_at_purchase' => (float) $item['price_at_purchase'],
        ];
    }

    $result = [];
    foreach ($orders as $o) {
        $oid      = (int)$o['order_id'];
        $result[] = [
            'order_id'     => $oid,
            'order_status' => $o['order_status'],
            'est_prep_time'=> $o['est_prep_time'],
            'total_price'  => (float)$o['total_price'],
            'created_at'   => $o['created_at'],
            'items'        => isset($itemsByOrder[$oid]) ? $itemsByOrder[$oid] : [],
        ];
    }

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

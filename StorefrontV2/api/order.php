<?php

/**
 * api/order.php
 * Returns a list of all orders formatted for the UI
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

try {
    $pdo  = getDB();
    
    // Fetch all orders with product names
    $stmt = $pdo->prepare(
        "SELECT d.order_id, d.user_id, d.product_id, p.name AS product_name,
                d.est_prep_time, d.order_status, d.created_at
         FROM   delivery d
         JOIN   products p ON p.product_id = d.product_id
         ORDER BY d.created_at DESC"
    );
    
    $stmt->execute();
    
    // Fetch all results as an associative array
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data types (strings to integers)
    $formattedOrders = [];
    foreach ($rows as $row) {
        $row['order_id']   = (int) $row['order_id'];
        $row['user_id']    = (int) $row['user_id'];
        $row['product_id'] = (int) $row['product_id'];
        $formattedOrders[] = $row;
    }

    // Wrap the response so it matches your JS: if (data.status === 'success')
    echo json_encode([
        "status" => "success",
        "orders" => $formattedOrders
    ]);

} catch (PDOException $e) {
    // If something breaks, send a 500 error with a JSON message
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
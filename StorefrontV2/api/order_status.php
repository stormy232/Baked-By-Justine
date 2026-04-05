<?php
/**
 * api/order_status.php
 * GET ?order_id=1042  -> returns order details + status
 *
 * Response:
 * {
 *   "order_id":      1042,
 *   "user_id":       1,
 *   "product_name":  "Cinnamon Roll",
 *   "est_prep_time": "20-30 minutes",
 *   "order_status":  "pending",
 *   "created_at":    "2025-04-05 14:32:00"
 * }
 */

require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

$orderId = isset($_GET['order_id']) ? (int) $_GET['order_id'] : 0;

if ($orderId < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'order_id is required']);
    exit;
}

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare(
        "SELECT d.order_id, d.user_id, d.product_id, p.name AS product_name,
                d.est_prep_time, d.order_status, d.created_at
         FROM   delivery d
         JOIN   products p ON p.product_id = d.product_id
         WHERE  d.order_id = ?"
    );
    $stmt->execute([$orderId]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => "Order #$orderId not found"]);
        exit;
    }

    $row['order_id']   = (int) $row['order_id'];
    $row['user_id']    = (int) $row['user_id'];
    $row['product_id'] = (int) $row['product_id'];

    echo json_encode($row);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

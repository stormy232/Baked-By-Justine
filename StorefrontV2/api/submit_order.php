<?php
/**
 * api/submit_order.php
 * POST: inserts one or more rows into the `delivery` table.
 *
 * Expected JSON body:
 * {
 *   "user_id":    1,
 *   "items": [
 *     { "product_id": 2, "qty": 1 },
 *     { "product_id": 6, "qty": 3 }
 *   ],
 *   "est_prep_time": "20-30 minutes"
 * }
 *
 * Response on success:
 * {
 *   "success": true,
 *   "order_ids": [1042, 1043],
 *   "created_at": "2025-04-05 14:32:00"
 * }
 *
 * One delivery row is inserted per product
 */

require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// -- Parse body --
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

// ── Validate required fields ──
$userId   = isset($body['user_id'])      ? (int) $body['user_id']      : 0;
$items    = isset($body['items'])        ? $body['items']               : [];
$prepTime = isset($body['est_prep_time'])? trim($body['est_prep_time']) : '20-30 minutes';

if ($userId < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id must be a positive integer']);
    exit;
}

if (empty($items)) {
    http_response_code(400);
    echo json_encode(['error' => 'items array is empty']);
    exit;
}

// ── Validate user exists ──
try {
    $pdo = getDB();

    $chk = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $chk->execute([$userId]);
    if (!$chk->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => "user_id $userId not found in users table"]);
        exit;
    }

    // ── Insert one row per product ──
    $stmt = $pdo->prepare(
        "INSERT INTO delivery (user_id, product_id, est_prep_time, order_status)
         VALUES (?, ?, ?, 'pending')"
    );

    $orderIds  = [];
    $createdAt = null;

    $pdo->beginTransaction();

    foreach ($items as $item) {
        $productId = isset($item['product_id']) ? (int) $item['product_id'] : 0;

        if ($productId < 1) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['error' => "Invalid product_id in items"]);
            exit;
        }

        // Check product exists & has stock
        $pchk = $pdo->prepare("SELECT quantity FROM products WHERE product_id = ?");
        $pchk->execute([$productId]);
        $prod = $pchk->fetch();

        if (!$prod) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['error' => "product_id $productId not found"]);
            exit;
        }

        if ((int)$prod['quantity'] <= 0) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => "product_id $productId is out of stock"]);
            exit;
        }

        $stmt->execute([$userId, $productId, $prepTime]);
        $orderIds[] = (int) $pdo->lastInsertId();
    }

    $pdo->commit();

    // Fetch created_at from the first inserted row
    if (!empty($orderIds)) {
        $ts = $pdo->prepare("SELECT created_at FROM delivery WHERE order_id = ?");
        $ts->execute([$orderIds[0]]);
        $row = $ts->fetch();
        $createdAt = $row ? $row['created_at'] : date('Y-m-d H:i:s');
    }

    echo json_encode([
        'success'    => true,
        'order_ids'  => $orderIds,
        'created_at' => $createdAt,
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

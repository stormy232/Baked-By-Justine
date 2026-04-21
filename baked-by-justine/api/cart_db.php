<?php
// ============================================================
// api/cart_db.php
// Handles DB cart for logged-in users
// Actions: get, add, update, remove, clear


// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/db.php';
session_start();

$action = $_GET['action'] ?? '';
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// Must be logged in
if (empty($_SESSION['user_id'])) {
    respond(['success' => false, 'error' => 'Not logged in.'], 401);
}

$userId = (int)$_SESSION['user_id'];

try {
    $db = getDB();

    // Ensure cart table exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS cart (
            user_id    INT NOT NULL,
            product_id INT NOT NULL,
            qty        INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, product_id),
            FOREIGN KEY (user_id)    REFERENCES users(id)              ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id)   ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    switch ($action) {

        // ── GET cart with full product info ──────────────────
        case 'get':
            $stmt = $db->prepare("
                SELECT c.product_id, c.qty,
                       p.name, p.price, p.quantity AS stock,
                       p.description, p.category,
                       p.discount_percent, p.image_link,
                       CASE WHEN p.discount_percent > 0
                            THEN ROUND(p.price * (1 - p.discount_percent/100), 2)
                            ELSE NULL END AS discounted_price
                FROM cart c
                JOIN products p ON p.product_id = c.product_id
                WHERE c.user_id = :uid
                ORDER BY c.created_at ASC
            ");
            $stmt->execute([':uid' => $userId]);
            $items = $stmt->fetchAll();
            respond(['success' => true, 'items' => $items]);

        // ── ADD / INCREMENT ───────────────────────────────────
        case 'add':
            $productId = (int)($input['product_id'] ?? 0);
            if (!$productId) respond(['success' => false, 'error' => 'Invalid product.'], 400);

            // Check stock
            $stock = $db->prepare('SELECT quantity FROM products WHERE product_id = :pid');
            $stock->execute([':pid' => $productId]);
            $product = $stock->fetch();
            if (!$product) respond(['success' => false, 'error' => 'Product not found.'], 404);
            if ($product['quantity'] <= 0) respond(['success' => false, 'error' => 'Out of stock.'], 400);

            // Check current qty in cart
            $cur = $db->prepare('SELECT qty FROM cart WHERE user_id = :uid AND product_id = :pid');
            $cur->execute([':uid' => $userId, ':pid' => $productId]);
            $existing = $cur->fetch();
            $newQty = $existing ? $existing['qty'] + 1 : 1;

            if ($newQty > $product['quantity']) {
                respond(['success' => false, 'error' => 'Only ' . $product['quantity'] . ' available in stock.'], 400);
            }

            $stmt = $db->prepare("
                INSERT INTO cart (user_id, product_id, qty)
                VALUES (:uid, :pid, :qty)
                ON DUPLICATE KEY UPDATE qty = :qty2
            ");
            $stmt->execute([':uid' => $userId, ':pid' => $productId, ':qty' => $newQty, ':qty2' => $newQty]);
            respond(['success' => true, 'qty' => $newQty]);

        // ── UPDATE qty directly ───────────────────────────────
        case 'update':
            $productId = (int)($input['product_id'] ?? 0);
            $qty       = (int)($input['qty']        ?? 0);
            if (!$productId) respond(['success' => false, 'error' => 'Invalid product.'], 400);

            if ($qty <= 0) {
                $del = $db->prepare('DELETE FROM cart WHERE user_id = :uid AND product_id = :pid');
                $del->execute([':uid' => $userId, ':pid' => $productId]);
                respond(['success' => true, 'removed' => true]);
            }

            // Stock check
            $stock = $db->prepare('SELECT quantity FROM products WHERE product_id = :pid');
            $stock->execute([':pid' => $productId]);
            $product = $stock->fetch();
            if ($qty > $product['quantity']) {
                respond(['success' => false, 'error' => 'Only ' . $product['quantity'] . ' available.'], 400);
            }

            $stmt = $db->prepare("
                INSERT INTO cart (user_id, product_id, qty)
                VALUES (:uid, :pid, :qty)
                ON DUPLICATE KEY UPDATE qty = :qty2
            ");
            $stmt->execute([':uid' => $userId, ':pid' => $productId, ':qty' => $qty, ':qty2' => $qty]);
            respond(['success' => true, 'qty' => $qty]);

        // ── REMOVE one item ───────────────────────────────────
        case 'remove':
            $productId = (int)($input['product_id'] ?? 0);
            $stmt = $db->prepare('DELETE FROM cart WHERE user_id = :uid AND product_id = :pid');
            $stmt->execute([':uid' => $userId, ':pid' => $productId]);
            respond(['success' => true]);

        // ── CLEAR entire cart ─────────────────────────────────
        case 'clear':
            $stmt = $db->prepare('DELETE FROM cart WHERE user_id = :uid');
            $stmt->execute([':uid' => $userId]);
            respond(['success' => true]);

        default:
            respond(['success' => false, 'error' => 'Unknown action.'], 400);
    }

} catch (Exception $e) {
    respond(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
?>

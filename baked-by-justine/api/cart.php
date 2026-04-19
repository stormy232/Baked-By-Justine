<?php
/**
 * api/cart.php
 * Handles all cart operations in one file
 *
 * GET  ?customer_email=x              -> fetch all cart items for this email
 * POST { action:"add",    ... }       -> add qty to a product
 * POST { action:"update", ... }       -> set exact qty (0 = remove)
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

//  GET: fetch cart 
if ($method === 'GET') {
    $email = isset($_GET['customer_email']) ? trim($_GET['customer_email']) : '';

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'A valid email is required']);
        exit;
    }

    try {
        $pdo  = getDB();
        $stmt = $pdo->prepare(
            "SELECT c.product_id, c.qty,
                    p.name, p.price, p.discount_percent,
                    p.category, p.description, p.image_link, p.quantity AS stock
             FROM   cart c
             JOIN   products p ON p.product_id = c.product_id
             WHERE  c.customer_email = ?
             ORDER  BY p.category, p.name"
        );
        $stmt->execute([$email]);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['product_id']       = (int)   $r['product_id'];
            $r['qty']              = (int)   $r['qty'];
            $r['price']            = (float) $r['price'];
            $r['discount_percent'] = (float) $r['discount_percent'];
            $r['stock']            = (int)   $r['stock'];
        }
        unset($r);

        echo json_encode($rows);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

//  POST: add or update 
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $action    = isset($body['action'])         ? $body['action']               : '';
    $email     = isset($body['customer_email']) ? trim($body['customer_email']) : '';
    $productId = isset($body['product_id'])     ? (int) $body['product_id']     : 0;
    $qty       = isset($body['qty'])            ? (int) $body['qty']            : 0;

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'A valid email is required']);
        exit;
    }

    if ($productId < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'A valid product is required']);
        exit;
    }

    try {
        $pdo = getDB();

        //  ADD 
        if ($action === 'add') {
            if ($qty < 1) {
                http_response_code(400);
                echo json_encode(['error' => 'Quantity must be at least 1']);
                exit;
            }

            $check = $pdo->prepare("SELECT quantity FROM products WHERE product_id = ?");
            $check->execute([$productId]);
            $product = $check->fetch();

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                exit;
            }

            // Get current cart qty so we can check against stock
            $existing = $pdo->prepare("SELECT qty FROM cart WHERE customer_email = ? AND product_id = ?");
            $existing->execute([$email, $productId]);
            $row    = $existing->fetch();
            $newQty = $row ? $row['qty'] + $qty : $qty;

            if ($newQty > (int)$product['quantity']) {
                http_response_code(409);
                echo json_encode([
                    'error'     => 'Not enough stock',
                    'available' => (int)$product['quantity']
                ]);
                exit;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO cart (customer_email, product_id, qty)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)"
            );
            $stmt->execute([$email, $productId, $qty]);

            $updated = $pdo->prepare("SELECT qty FROM cart WHERE customer_email = ? AND product_id = ?");
            $updated->execute([$email, $productId]);
            $updatedRow = $updated->fetch();

            echo json_encode(['success' => true, 'qty' => (int)$updatedRow['qty']]);

        //  UPDATE / REMOVE 
        } elseif ($action === 'update') {
            if ($qty <= 0) {
                $stmt = $pdo->prepare("DELETE FROM cart WHERE customer_email = ? AND product_id = ?");
                $stmt->execute([$email, $productId]);
                echo json_encode(['success' => true, 'removed' => true]);
            } else {
                $check = $pdo->prepare("SELECT quantity FROM products WHERE product_id = ?");
                $check->execute([$productId]);
                $product = $check->fetch();

                if (!$product) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                    exit;
                }

                if ($qty > (int)$product['quantity']) {
                    http_response_code(409);
                    echo json_encode([
                        'error'     => 'Not enough stock',
                        'available' => (int)$product['quantity']
                    ]);
                    exit;
                }

                $stmt = $pdo->prepare(
                    "INSERT INTO cart (customer_email, product_id, qty)
                     VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE qty = VALUES(qty)"
                );
                $stmt->execute([$email, $productId, $qty]);
                echo json_encode(['success' => true, 'qty' => $qty]);
            }

        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Unknown action. Use add or update']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

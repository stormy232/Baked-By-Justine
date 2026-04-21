<?php
/**
 * api/products.php
 * GET -> returns all products ordered by category, name
 * 
 * Creator: Ridwan Moalim
 * Purpose: Access all products with quantity > 0
 */

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

try {
    $pdo  = getDB();
    $stmt = $pdo->query(
        "SELECT product_id, name, price, quantity, description,
                discount_percent, image_link, category
         FROM   products
         WHERE  quantity >= 0
         ORDER  BY category, name"
    );
    $products = $stmt->fetchAll();

    foreach ($products as &$p) {
        $p['product_id']       = (int)   $p['product_id'];
        $p['price']            = (float) $p['price'];
        $p['quantity']         = (int)   $p['quantity'];
        $p['discount_percent'] = (float) $p['discount_percent'];
    }
    unset($p);

    echo json_encode($products);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
}

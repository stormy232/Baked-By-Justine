<?php
// ============================================================
// api/products.php
// Returns products from the database as JSON.
// Supports optional ?category=X filter and ?search=X search.
// ============================================================



// Creator: Abdullah Musani

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // allow same-origin fetch

require_once __DIR__ . '/db.php';

$db = getDB();

// --- Build query based on optional filters ---
$conditions = [];
$params     = [];

// Category filter: ?category=Breads
if (!empty($_GET['category'])) {
    $conditions[] = 'category = :category';
    $params[':category'] = trim($_GET['category']);
}

// Search filter: ?search=sourdough
if (!empty($_GET['search'])) {
    $conditions[] = '(name LIKE :search OR description LIKE :search)';
    $params[':search'] = '%' . trim($_GET['search']) . '%';
}

$sql = 'SELECT product_id, name, price, quantity, description, discount_percent, image_link, category
        FROM products';

if ($conditions) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}

$sql .= ' ORDER BY category, name';

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Add a computed "discounted_price" field so the frontend doesn't have to calculate it
foreach ($products as &$p) {
    $p['discounted_price'] = $p['discount_percent'] > 0
        ? round($p['price'] * (1 - $p['discount_percent'] / 100), 2)
        : null;
}
unset($p);

echo json_encode([
    'success'  => true,
    'count'    => count($products),
    'products' => $products
]);
?>

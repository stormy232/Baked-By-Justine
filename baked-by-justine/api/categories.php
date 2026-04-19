<?php
// ============================================================
// api/categories.php
// Returns a list of all distinct categories from the database.
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/db.php';

$db   = getDB();
$stmt = $db->query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
$rows = $stmt->fetchAll();

$categories = array_column($rows, 'category');

echo json_encode([
    'success'    => true,
    'categories' => $categories
]);
?>

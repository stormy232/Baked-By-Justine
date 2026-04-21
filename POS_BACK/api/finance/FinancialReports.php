<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint that returns financial report data as JSON, including
//              overview metrics (gross sales, order count, average order value)
//              and a revenue breakdown by product for a given date range.
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost"); // Added http:// for validity
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
require_once '../config.php'; 

$response = [
    'overview_tiles' => [
        'gross_sales' => 0,
        'total_orders' => 0,
        'aov' => 0.00
    ],
    'sales_by_product' => [],
    'errors' => []
];

try {
    // Standardize date format to include full day for DATETIME columns
    $start = $_GET['start'] ?? date('Y-m-01');
    $end = $_GET['end'] ?? date('Y-m-d');
    
    // Append time to end date to catch orders made on the final day
    $end_dt = $end . ' 23:59:59';

    $response['overview_tiles'] = getOverviewTiles($dbh, $start, $end_dt);
    $response['sales_by_product'] = getSalesByProduct($dbh, $start, $end_dt);

} catch (Exception $e) {
    $response['errors'][] = $e->getMessage();
}

echo json_encode($response);
exit;

/**
 * Queries the database for high-level financial overview metrics within a date range.
 *
 * @param PDO $pdo The active PDO database connection
 * @param string $start The start datetime string for the report period (e.g., '2025-01-01')
 * @param string $end The end datetime string for the report period, including time (e.g., '2025-01-31 23:59:59')
 * @return array Associative array with keys 'gross_sales' (float), 'total_orders' (int), and 'aov' (float)
 */
function getOverviewTiles($pdo, $start, $end) {
    // Changed COUNT(id) to COUNT(order_id)
    $stmt = $pdo->prepare("
        SELECT 
            COALESCE(SUM(total_price), 0) as gross_sales,
            COUNT(order_id) as total_orders,
            COALESCE(AVG(total_price), 0) as aov
        FROM delivery 
        WHERE created_at BETWEEN :start AND :end
    ");
    $stmt->execute(['start' => $start, 'end' => $end]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    return [
        'gross_sales' => (float)$data['gross_sales'],
        'total_orders' => (int)$data['total_orders'],
        'aov' => (float)$data['aov']
    ];
}

/**
 * Queries the database for per-product sales totals within a date range, ordered by revenue.
 *
 * @param PDO $pdo The active PDO database connection
 * @param string $start The start datetime string for the report period (e.g., '2025-01-01')
 * @param string $end The end datetime string for the report period, including time (e.g., '2025-01-31 23:59:59')
 * @return array Indexed array of associative arrays, each with keys 'product_name' (string), 'qty' (int), and 'revenue' (float)
 */
function getSalesByProduct($pdo, $start, $end) {
    // Updated JOINs to use order_id and product_id
    $stmt = $pdo->prepare("
        SELECT 
            p.name as product_name,
            SUM(oi.quantity) as qty,
            SUM(oi.price_at_purchase * oi.quantity) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN delivery d ON oi.order_id = d.order_id
        WHERE d.created_at BETWEEN :start AND :end
        GROUP BY p.product_id
        ORDER BY revenue DESC
    ");
    $stmt->execute(['start' => $start, 'end' => $end]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast values to numbers so JS doesn't have to
    return array_map(function($row) {
        return [
            'product_name' => $row['product_name'],
            'qty' => (int)$row['qty'],
            'revenue' => (float)$row['revenue']
        ];
    }, $rows);
}
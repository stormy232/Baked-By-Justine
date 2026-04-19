<?php
/**
 * financeReports.php - Stripe-Only POS Analytics
 */

header('Content-Type: application/json');
require_once 'config.php';

// --- Execution Block ---
$dbh = createPDO();
$startDate = $_GET['start'] ?? date('Y-m-01');
$endDate = $_GET['end'] ?? date('Y-m-d');
//Fix Conn Block and yeah fix the rest of the stuff as well
$response = [
    'metadata' => getMetadata($startDate, $endDate),
    'overview_tiles' => getSalesOverview($dbh, $startDate, $endDate),
    'stripe_reconciliation' => getStripeMetrics($dbh, $startDate, $endDate),
    'sales_by_product' => getProductSales($dbh, $startDate, $endDate),
    'errors' => []
];

if (isset($GLOBALS['api_errors'])) {
    $response['errors'] = $GLOBALS['api_errors'];
    http_response_code(500);
}

echo json_encode($response, JSON_PRETTY_PRINT);
exit;

// --- Function Definitions ---

function getMetadata($start, $end) {
    return [
        'period' => ['start' => $start, 'end' => $end],
        'processor' => 'Stripe (Fixed)',
        'generated_at' => date('c')
    ];
}

/**
 * Calculates high-level totals from the delivery table.
 */
function getSalesOverview($conn, $start, $end) {
    $sql = "SELECT 
                COUNT(order_id) as total_orders, 
                SUM(total_price) as gross_sales,
                AVG(total_price) as aov
             FROM delivery 
             WHERE created_at BETWEEN ? AND ? 
             AND order_status = 'completed'";
    
    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $start, $end);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();

        return [
            'gross_sales'  => (float)($res['gross_sales'] ?? 0),
            'total_orders' => (int)($res['total_orders'] ?? 0),
            'aov'          => round((float)($res['aov'] ?? 0), 2)
        ];
    } catch (Exception $e) {
        $GLOBALS['api_errors'][] = "Overview Error: " . $e->getMessage();
        return null;
    }
}

/**
 * STRIPE-SPECIFIC METRICS
 * Calculates estimated fees (Stripe CA: 2.9% + $0.30 per transaction)
 */
function getStripeMetrics($conn, $start, $end) {
    $sql = "SELECT total_price FROM delivery 
            WHERE created_at BETWEEN ? AND ? 
            AND order_status = 'completed'";
    
    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $start, $end);
        $stmt->execute();
        $result = $stmt->get_result();

        $totalGross = 0;
        $estimatedFees = 0;
        $count = 0;

        while ($row = $result->fetch_assoc()) {
            $price = (float)$row['total_price'];
            $totalGross += $price;
            // Stripe CA Standard Fee: 2.9% + 30 cents
            $estimatedFees += ($price * 0.029) + 0.30;
            $count++;
        }

        return [
            'total_gross' => $totalGross,
            'estimated_fees' => round($estimatedFees, 2),
            'estimated_net_payout' => round($totalGross - $estimatedFees, 2),
            'processing_rate_effective' => $totalGross > 0 ? round(($estimatedFees / $totalGross) * 100, 2) . '%' : '0%'
        ];
    } catch (Exception $e) {
        $GLOBALS['api_errors'][] = "Stripe Calc Error: " . $e->getMessage();
        return null;
    }
}

function getProductSales($conn, $start, $end) {
    $sql = "SELECT 
                p.name, 
                SUM(oi.quantity) as units_sold,
                SUM(oi.quantity * oi.price_at_purchase) as product_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN delivery d ON oi.order_id = d.order_id
             WHERE d.created_at BETWEEN ? AND ?
             AND d.order_status = 'completed'
             GROUP BY p.id
             ORDER BY product_revenue DESC";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $start, $end);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    } catch (Exception $e) {
        $GLOBALS['api_errors'][] = "Product Sales Error: " . $e->getMessage();
        return [];
    }
}

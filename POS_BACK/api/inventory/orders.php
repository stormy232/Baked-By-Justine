<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint for managing delivery orders. Handles retrieving orders
//              with their associated products, and updating order delivery status.
//              Restricted to authenticated owners and employees.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');
require_once  "../config.php";

session_start();

switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    getOrdersWithProducts($dbh);
    break;
  case "POST":
    handleUpdateDeliveryStatus($dbh);
};

/**
 * Retrieves all orders with their associated product line items within a date range.
 * Groups flat SQL join rows into nested order objects, each containing an items array.
 * Requires the session user to have 'owner' or 'employee' privilege.
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON array of order objects, each with order details and a nested items array
 */
function getOrdersWithProducts($dbh) {
    if ($_SESSION["privilege"] !== "owner" && $_SESSION["privilege"] !== "employee"){
        http_response_code(400);
        echo json_encode(["error" => "Insufficient Perms"]);
        exit;
    }

    $start_date = filter_input(INPUT_GET, "start_date", FILTER_SANITIZE_SPECIAL_CHARS);
    $end_date = filter_input(INPUT_GET, "end_date", FILTER_SANITIZE_SPECIAL_CHARS);
    // 1. The SQL Query: Joining all 3 tables
    $sql = "SELECT 
                d.order_id, 
                d.customer_email, 
                d.order_status, 
                d.est_prep_time,
                d.total_price,
                d.created_at,
                p.name AS product_name, 
                oi.quantity, 
                oi.price_at_purchase
            FROM delivery d
            JOIN order_items oi ON d.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE d.created_at BETWEEN ? AND ?
            ORDER BY d.created_at DESC";

    try {
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$start_date,$end_date]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $orders = [];

        // 2. The Grouping Logic
        foreach ($rows as $row) {
            $id = $row['order_id'];

            // If we haven't seen this order ID yet, initialize its "header"
            if (!isset($orders[$id])) {
                $orders[$id] = [
                    "order_id"       => $id,
                    "customer_email" => $row['customer_email'],
                    "status"         => $row['order_status'],
                    "prep_time"      => $row['est_prep_time'],
                    "total_bill"     => $row['total_price'],
                    "date"           => $row['created_at'],
                    "items"          => [] // The "Array" of products lives here
                ];
            }

            // 3. Add the current row's product info into the "items" array
            $orders[$id]['items'][] = [
                "name"     => $row['product_name'],
                "quantity" => $row['quantity'],
                "price"    => $row['price_at_purchase']
            ];
        }

        // 4. Reset array keys so it returns as a standard JSON list [] instead of an object {}
        echo json_encode(array_values($orders));

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

/**
 * Updates the delivery status of a specific order and sends a notification email if the order is marked as finished.
 * Requires the session user to have 'owner' or 'employee' privilege.
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON success or error message; sends an email to the customer if status is 'finished'
 */
function handleUpdateDeliveryStatus($dbh)
{
     if ($_SESSION["privilege"] !== "owner" && $_SESSION["privilege"] !== "employee"){
        http_response_code(400);
        echo json_encode(["error" => "Insufficient Perms"]);
        exit;
    }
    $orderId = filter_input(INPUT_POST, "orderId", FILTER_VALIDATE_INT) ?: null;
    $status = filter_input(INPUT_POST, "status", FILTER_SANITIZE_SPECIAL_CHARS) ?: null;

    // 2. Strict Validation
    // Check if the inputs are missing
    if ($orderId === null || $status === null) {
        http_response_code(400);
        echo json_encode([
            "error" => "Invalid Argument Passed In",
            "received" => ["orderId" => $orderId, "status" => $status]
        ]);
        exit;
    }

    // 3. Define the Allowed Statuses (matches your SQL ENUM)
    $allowedStatuses = ['pending', 'preparing', 'finished'];
    
    if (!in_array($status, $allowedStatuses)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid status value provided"]);
        exit;
    }

    // 4. The Update Statement
    $sql = "SELECT customer_email FROM delivery WHERE order_id = ?"; 
    $stmt = $dbh->prepare($sql);
    $success = $stmt->execute([$orderId]);
    $user_email = "";
    if($stmt->rowcount() > 0){
      $row = $stmt->fetch();
      $user_email = $row["customer_email"];
    }
    else{
      echo json_encode(["error" => "Couldn't Obtain SQL records"]);
      exit;
    }
    $sql = "UPDATE delivery SET order_status = ? WHERE order_id = ?";
    $stmt = $dbh->prepare($sql);
    
    $success = $stmt->execute([$status, $orderId]);

    if (!$success) {
        http_response_code(500);
        echo json_encode(["error" => "Server was unable to update the delivery status"]);
        exit;
    } else {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Order #$orderId is now $status"
        ]);
        if($status === "finished"){
          $subject = "Justine Bakes Order#:$orderId";
          $message = "Your order is now ready for pickup! Thank you for your patronage.";
          $headers = "From: bakery@justine.com" . "\r\n" .
           "Reply-To: bakery@justine.com" . "\r\n" .
           "Content-Type: text/html; charset=UTF-8" . "\r\n";
            mail($user_email, $subject, $message, $headers);
        }
    }
}

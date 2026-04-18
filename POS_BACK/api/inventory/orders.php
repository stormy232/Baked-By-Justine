<?php
require_once __DIR__ . "/config.php";
try {
  $dbh = new PDO("mysql:host={$config["db_url"]};dbname={$config["db_name"]}", "{$config["db_user"]}", "{$config["db_pass"]}");
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "Error: Initalizing Database"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "DELETE":
    //    removeItem($dbh);
    break;
  case "GET":
    selectOrders($dbh);
    break;
  case "POST":
    //   handlePostItem($dbh, $options["img_path"]);
    break;
  case "PUT":
    handleUpdateDeliveryStatus($dbh);
};

function getOrdersWithProducts($dbh) {
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
            ORDER BY d.created_at DESC";

    try {
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
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
        return array_values($orders);

    } catch (PDOException $e) {
        return ["error" => $e->getMessage()];
    }
}

function handleUpdateDeliveryStatus($dbh)
{
    // 1. Get the Order ID and the New Status
    $orderId = filter_input(INPUT_POST, "order_id", FILTER_VALIDATE_INT);
    $status = filter_input(INPUT_POST, "status", FILTER_SANITIZE_SPECIAL_CHARS);

    // 2. Strict Validation
    // Check if the inputs are missing
    if ($orderId === null || $status === null) {
        http_response_code(400);
        echo json_encode([
            "error" => "Invalid Argument Passed In",
            "received" => ["order_id" => $orderId, "status" => $status]
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
    $sql = "SELECT cutomer_email FROM delivery WHERE order_id = ?"; 
    $stmt = $dbh->prepare($sql);
    $success = $stmt->execute($orderId);
    $user_email = ""
    if($success->rowcount() > 0){
      $row = $stmt->fetch();
      $user_email = $row["user_email"];
    }
    else{
      echo json_encode(["error" => "Couldn't Obtain SQL records"];
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
          if(mail($to, $subject, $message, $headers)) {
            echo "Email sent successfully.";
          } else {
              echo "Email delivery failed.";
          }
        }
    }
}

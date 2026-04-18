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
    selectAllOrders($dbh);
    break;
  case "POST":
    //   handlePostItem($dbh, $options["img_path"]);
    break;
};

function selectAllOrders($dbh)
{
  try {
    $stmt = $dbh->prepare(
      "SELECT d.order_id, d.user_id, d.product_id, p.name AS product_name,
    d.est_prep_time, d.order_status, d.created_at
    FROM   delivery d
    JOIN   products p ON p.product_id = d.product_id"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
      $row['order_id']   = (int) $row['order_id'];
      $row['user_id']    = (int) $row['user_id'];
      $row['product_id'] = (int) $row['product_id'];
    }

    echo json_encode(['status' => 'success', 'orders' => $rows]);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
  }
}

function updateOrders($dbh) {}

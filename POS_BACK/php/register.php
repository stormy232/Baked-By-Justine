<?php
require_once __DIR__ . "/config.php";
session_start();
if (!isset($_SESSION["privilege"])) {
  http_response_code(404);
  echo json_encode(["error" => "Invalid Permissions"]);
}
try {
  $dbh = new PDO("mysql:host={$config["db_url"]};dbname={$config["db_name"]}", "{$config["db_user"]}", "{$config["db_pass"]}");
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "Error: Initalizing Database"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "POST":
    RegisterUser($dbh);
    break;
};

function RegisterUser($dbh)
{
  $SQL_STATEMENT = "INSERT INTO users (username, password_hash, privilege)";
  $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS);
  $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_SPECIAL_CHARS);
  $privilege = filter_input(INPUT_POST, "privilege", FILTER_SANITIZE_SPECIAL_CHARS);
  $password_hash = password_hash($password, PASSWORD_BCRYPT);
  $stmt = $dbh->prepare($SQL_STATEMENT);
  $result = $stmt->execute($username, $password_hash, $privilege);
  if ($stmt->rowCount() === 0) {
    echo json_encode(["error" => "Issue Processing Transaction With DB"]);
  } else {
    echo json_encode(["success" => "User Created"]);
  }
}

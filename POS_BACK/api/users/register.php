<?php
header("Access-Control-Allow-Origin: localhost");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once "../config.php";


session_start();
if ($_SESSION["privilege"] !== "owner") {
  http_response_code(404);
  echo json_encode(["error" => "Invalid Permissions"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "POST":
    registerUser($dbh);
    break;
  case "GET":
    deleteUser($dbh);
    break;
};

function registerUser($dbh)
{
  $SQL_STATEMENT = "INSERT INTO users (username, password_hash, privilege) VALUES (?, ?, ?)";
  $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS);
  $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_SPECIAL_CHARS);
  $privilege = filter_input(INPUT_POST, "privilege", FILTER_SANITIZE_SPECIAL_CHARS);
  $password_hash = password_hash($password, PASSWORD_BCRYPT);
  $stmt = $dbh->prepare($SQL_STATEMENT);
  $result = $stmt->execute([$username, $password_hash, $privilege]);

  if ($stmt->rowCount() === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Issue Processing Transaction With DB"]);
    exit;
  } else {
    echo json_encode(["success" => "User Created"]);
  }
}

function deleteUser($dbh){
  $userid = filter_input(INPUT_GET, "userid", FILTER_VALIDATE_INT);
  if($userid === null || !$userid){
    http_response_code(400);
    echo json_encode(["error" => "No userid provided"]);
    exit;
  }
  $SQL_STATEMENT = "DELETE FROM users WHERE user_id=?";
  $stmt = $dbh->prepare($SQL_STATEMENT);
  $result = $stmt->execute([$userid]);
  if ($stmt->rowCount() > 0){
    echo json_encode(["success" => "User Destroyed"]);
    exit;
  }
  else{
    echo json_encode(["error" => "User Couldn't Be Destroyed"]);
  }
}

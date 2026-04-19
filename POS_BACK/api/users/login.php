<?php
require_once __DIR__ . "/config.php";
session_start();
try {
  $dbh = new PDO("mysql:host={$config["db_url"]};dbname={$config["db_name"]}", "{$config["db_user"]}", "{$config["db_pass"]}");
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "Error: Initalizing Database"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "POST":
    AuthorizeUser($dbh);
    break;
};

function AuthorizeUser($dbh)
{
  $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS);
  $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_SPECIAL_CHARS);
  if ($username === null || $password === null) {
    http_response_code(400);
    echo json_encode(["error" => "Username or Password was not provided"]);
    exit;
  } else {
    $SQL_STATEMENT = "SELECT * FROM users WHERE username=?";
    $stmt = $dbh->prepare($SQL_STATEMENT);
    $success = $stmt->execute([$username]);
    if (!$success) {
      http_response_code(500);
      echo json_encode(["error" => "Database retrieval failed"]);
      exit;
    } else {
      $result = $stmt->fetchAll();
      if (count($result) === 0) {
        http_response_code(400);
        echo json_encode(["error" => "user doesn't exist"]);
      } else {
        $db_pass = $result[0]["password_hash"];
        if (password_verify($password, $db_pass)) {
          $_SESSION["user"] = $result[0]["user_id"];
          $_SESSION["privilege"] = $result[0]["privilege"];
          echo json_encode(["success" => "login"]);
        } else {
          http_response_code(404);
          echo json_encode(["error" => "Password Doesn't Match User"]);
        }
      }
    }
  }
}

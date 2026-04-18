<?php
require_once __DIR__ . '/config.php';
session_start();
try {
  $dbh = new PDO("mysql:host={$config["db_url"]};dbname={$config["db_name"]}", "{$config["db_user"]}", "{$config["db_pass"]}");
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "Error: Initalizing Database"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    AuthorizeUser($dbh);
    break;
};

function AuthorizeUser($dbh){
  $username = filter_input(INPUT_GET, "username", FILTER_SANITIZE_SPECIAL_CHARS);
  $password = filter_input(INPUT_GET, "password", FILTER_SANITIZE_SPECIAL_CHARS);
  if($username === null || $password === null){
    http_response_code(400);
    echo json_encode(["error" => "Username or Password was not provided"]);
    exit;
}
  else{
    $SQL_STATEMENT = "SELECT * FROM users WHERE username=? AND password_hash=?";
   $password_hash = password_hash($password, PASSWORD_BCRYPT);
   $stmt = dbh->prepare($SQL_STATEMENT);
   $success = $stmt->execute($username, $password);
    if(!$success){
        http_response_code(500);
    echo json_encode(["error" => "Database retrieval failed"]);
    exit;
    }
    else{
        $result = $stmt->fetchAll();
        if(count($result) === 0){
            http_response_code(400);
            echo json_encode(["error" => "user doesn't exist"]);
        }
        else{
           http_response_code(200);
           echo json_encode(["user_id" => $result["user_id"], "privilege" => "privilege"]);
           $_SESSION["user"] = $result["user_id"];
           $_SESSION["privilege"] = $result["privilege"];
        }
    }
  }
}
?>
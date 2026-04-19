<?php

require_once __DIR__ . "/config.php";

session_start();
if (isset($_SESSION["privilege"]) !== "Owner") {
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
    registerUser($dbh);
    break;
  case "DELETE":
    deleteUser($dbh);
    break;
  case "PUT":
    updateUser($dbh);
    break;
};

function registerUser($dbh)
{
  $SQL_STATEMENT = "INSERT INTO users (username, password_hash, privilege)";
  $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS);
  $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_SPECIAL_CHARS);
  $privilege = filter_input(INPUT_POST, "privilege", FILTER_SANITIZE_SPECIAL_CHARS);
  $password_hash = password_hash($password, PASSWORD_BCRYPT);
  $stmt = $dbh->prepare($SQL_STATEMENT);
  $result = $stmt->execute([$username, $password_hash, $privilege]);

  if ($stmt->rowCount() === 0) {
    echo json_encode(["error" => "Issue Processing Transaction With DB"]);
    exit;
  } else {
    echo json_encode(["success" => "User Created"]);
  }
}

function deleteUser($dbh){
  $userid = filter_input(INPUT_GET, "userid", FILTER_VALIDATE_INT);
  if($userid === null || !$userid){
    echo json_encode(["error" => "No userid provided"]);
    exit;
  }
  $SQL_STATEMENT = "DELETE FROM users WHERE user_id=?";
  $stmt = $dbh->prepare($SQL_STATEMENT);
  $result = $stmt->execute($userid);
  if ($stmt->rowCount() > 0){
    echo json_encode(["success" => "User Destroyed"]);
    exit;
  }
  else{
    echo json_encode(["error" => "User Couldn't Be Destroyed"]);
  }
}

function updateUser($dbh) {
    // 1. Manually parse the PUT stream
    $putData = [];
    parse_str(file_get_contents("php://input"), $putData);

    $SQL_STATEMENT = "UPDATE users SET username = ?, password_hash = ?, privilege = ? WHERE user_id = ?";

    // 2. Use filter_var instead of filter_input(INPUT_POST...)
    $user_id       = filter_var($putData["user_id"], FILTER_VALIDATE_INT) ?: null;
    $username      = filter_var($putData["username"], FILTER_SANITIZE_SPECIAL_CHARS) ?: null;
    $password      = filter_var($putData["password"], FILTER_SANITIZE_SPECIAL_CHARS) ?: null;
    $privilege     = filter_var($putData["privilege"], FILTER_SANITIZE_SPECIAL_CHARS) ?: null;

    // 3. Logic remains largely the same
    if($user_id === null || $username === null || $password === null || $privilege === null){
      echo json_encode(["error" => "Missing a paramater"]);
      exit;
    }
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $dbh->prepare($SQL_STATEMENT);
    $stmt->execute([$username, $password_hash, $privilege, $user_id]);

    // Note: rowCount() is 0 if the data sent is identical to what's already in the DB
    if ($stmt->errorCode() !== '00000') {
        echo json_encode(["error" => "Issue Processing Transaction With DB"]);
        exit;
    } else {
        echo json_encode(["success" => "User Updated"]);
    }
}

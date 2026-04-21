<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint that handles user authentication. Verifies submitted
//              credentials against the database and initializes a session on success.
header("Access-Control-Allow-Origin: localhost");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
require_once "../config.php";
session_start();

switch ($_SERVER["REQUEST_METHOD"]) {
  case "POST":
    AuthorizeUser($dbh);
    break;
};

/**
 * Authenticates a user by verifying their username and hashed password against the database.
 * On success, stores the user's ID and privilege level in the session.
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON success or error message; sets session variables on successful login
 */
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

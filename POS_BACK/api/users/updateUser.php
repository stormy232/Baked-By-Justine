<?php
header("Access-Control-Allow-Origin: localhost");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
require_once "../config.php";

session_start();
if ($_SESSION["privilege"] !== "owner") {
  http_response_code(404);
  echo json_encode(["error" => "Invalid Permissions"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "POST":
    updateUser($dbh);
    break;
  case "GET":
    listUsers($dbh);
    break;
};

function updateUser($dbh) {
    // 1. Grab and filter data
    $user_id   = filter_input(INPUT_POST, 'userid', FILTER_VALIDATE_INT);
    $username  = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
    $password  = filter_input(INPUT_POST, 'password', FILTER_DEFAULT); // Don't sanitize passwords (can break symbols)
    $privilege = filter_input(INPUT_POST, 'privilege', FILTER_SANITIZE_SPECIAL_CHARS);

    if ($user_id === null || $user_id === false || $username === null || $privilege === null) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid parameters"]);
        exit;
    }

    // 2. Process Password Correctly
    // Bug Fix: If password is empty, $password_hash MUST be null for COALESCE to work
    $password_hash = null;
    if (!empty($password)) {
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
    }

    // 3. Execute the Update
    $SQL_STATEMENT = "UPDATE users SET username = ?, password_hash = COALESCE(?, password_hash), privilege = ? WHERE user_id = ?";
    
    try {
        $stmt = $dbh->prepare($SQL_STATEMENT);
        $success = $stmt->execute([$username, $password_hash, $privilege, $user_id]);

        if ($success) {
            echo json_encode(["success" => "User Updated"]);
        } else {
            throw new Exception("Update failed to execute");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

function listUsers($dbh) {
    $SQL_STATEMENT = "SELECT user_id, username, privilege, shift_status, last_active FROM users";
    try {
        $stmt = $dbh->prepare($SQL_STATEMENT);
        $success = $stmt->execute();
        
        if ($success) {
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetch as Assoc to prevent duplicate numeric keys
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "users" => $users
            ]);                
        }
    } catch (PDOException $e) {
        http_response_code(500); // Fixed typo: was http_error_code
        echo json_encode(["error" => "Database query failed"]);
    }
}
?>
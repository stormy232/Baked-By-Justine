<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint that handles user logout by destroying the current
//              PHP session and clearing all session data.

session_start();
switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    logoutUser($dbh);
    break;
};

/**
 * Clears all session data and destroys the current user session.
 *
 * @return void Outputs a JSON success message confirming the user has been logged out
 */
function logoutUser(){
    $_SESSION = array();
    session_destroy();
    echo json_encode(["success" => "User logged out"]);
}
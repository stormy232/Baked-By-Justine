<?php
session_start();
switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    logoutUser($dbh);
    break;
};


function logoutUser(){
    session_destroy();
    echo json_encode(["success" => "User logged out"]);
}
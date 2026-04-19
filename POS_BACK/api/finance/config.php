<?php
$config = [
    "db_url" => "localhost:41062",
    "db_name" => "team project",
    "db_user" => "root",
    "db_pass" => "",
    "img_path" => "server/",
    "remoteURL" => "http://cs1xd3.cas.mcmaster.ca/~randevv/Baked_By_Justine/php/server/"
];

function createPDO(){
try {
  global $config;
  $dbh = new PDO("mysql:host={$config["db_url"]};dbname={$config["db_name"]}", "{$config["db_user"]}", "{$config["db_pass"]}");
  return $dbh;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "Error:" . $e->getMessage()]);
    exit;
  }
}
?>

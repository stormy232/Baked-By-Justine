<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint for managing inventory products. Handles retrieving
//              products with optional filtering and pagination, adding new products
//              with image upload, updating existing products, and deleting products.
//              Restricted to authenticated owners for write operations.
header("Access-Control-Allow-Origin: localhost");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Parse without sections
header('Content-Type: application/json');
session_start();
require_once "../config.php";
switch ($_SERVER["REQUEST_METHOD"]) {
  case "GET":
    handleGetItem($dbh);
    break;
  case "POST":
    /** @var array $config Defined in config.php */
    handlePostItem($dbh, $config["img_path"]);
    break;
};

/**
 * Validates and uploads an image file to the server's target directory.
 * Checks that the file is a real image, does not already exist, is within the size limit,
 * and is of an accepted format (jpg, jpeg, png, gif).
 *
 * @param string $target_dir The server path to the directory where the image should be saved
 * @return void Moves the file on success; outputs a JSON error and exits on failure
 */
function checkfile($target_dir)
{
  $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
  $uploadOk = 1;
  $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

  // Check if image file is a actual image or fake image
  if (isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if ($check !== false) {
      // echo "File is an image - " . $check["mime"] . ".";
      $uploadOk = 1;
    } else {
      // echo "File is not an image.";
      $uploadOk = 0;
    }
  }

  // Check if file already exists
  if (file_exists($target_file)) {
    http_response_code(409);
    echo json_encode(["error" => "File Already Exists"]);
    $uploadOk = 0;
    exit;
  }

  // Check file size
  if ($_FILES["fileToUpload"]["size"] > 500000) {
    http_response_code(413);
    echo json_encode(["error" => "File Too Large"]);
    $uploadOk = 0;
    exit;
  }

  // Allow certain file formats
  if (
    $imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
    && $imageFileType != "gif"
  ) {
    http_response_code(415);
    echo json_encode(["error" => "File Not of Accepted FileType"]);
    $uploadOk = 0;
    exit;
  }

  // Check if $uploadOk is set to 0 by an error
  if ($uploadOk == 0) {
    http_response_code(500);
    echo json_encode(["error" => "Server had an Issue Processing Image upload"]);
    $uploadOk = 0;
    exit;
    // if everything is ok, try to upload file
  } else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
      // echo json_encode(["success" => "File has been succesfully uploaded"]);
    } else {
      http_response_code(500);
      echo json_encode(["error" => "Server had an Issue Processing Image upload"]);
      $uploadOk = 0;
      exit;
    }
  }
}

/**
 * Adds a new product to the database, including uploading the associated product image.
 * Requires the session user to have 'owner' privilege.
 *
 * @param PDO $dbh The active PDO database connection
 * @param string $target_dir The server path to the image upload directory
 * @return void Outputs a JSON success or error message
 */
function handlePostItem($dbh, $target_dir)
{
  if($_SESSION["privilege"] !== "owner"){
    http_response_code(400);
    echo json_encode(["error" => "Insufficient Permissions"]);
    exit;
  }
  $name = filter_input(INPUT_POST, "name");
  $price = filter_input(INPUT_POST, "price", FILTER_VALIDATE_FLOAT);
  $quantity = filter_input(INPUT_POST, "quantity", FILTER_VALIDATE_INT);
  $description = filter_input(INPUT_POST, "description", FILTER_SANITIZE_SPECIAL_CHARS);
  $discount = filter_input(INPUT_POST, "discount", FILTER_VALIDATE_FLOAT);
  $category = filter_input(INPUT_POST, "category", FILTER_SANITIZE_SPECIAL_CHARS);

  if (($name === null || $price === null || $quantity === null || $description === null || $category === null || $discount === null)) {
    echo [$name, $price, $quantity, $description, $discount, $category];
    http_response_code(400);
    echo json_encode(["error" => ["Invalid Argument Passed In"]]);
    exit;
  }
  checkfile($target_dir);

  $UPLOAD_STATEMENT = "INSERT INTO products (name, price, quantity, description, discount, image_link, category) VALUES (?, ?, ?, ?, ?, ?, ?)";
  $uploader = $dbh->prepare($UPLOAD_STATEMENT);
  $success = $uploader->execute([$name, $price, $quantity, $description, $discount, $config["remoteURL"] . basename($_FILES["fileToUpload"]["name"]), $category]);
  if (!$success) {
    http_response_code(500);
    echo json_encode(["error" => ["Server was unable to update database"]]);
    exit;
  } else {
    http_response_code(200);
    echo json_encode(["status" => "success: 200",]);
  }
}


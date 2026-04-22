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
    handlePostItem($dbh, $config["img_path"], $config["remoteURL"]);
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
function handlePostItem($dbh, $target_dir, $remoteURL)
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
    http_response_code(400);
    echo json_encode(["error" => ["Invalid Argument Passed In"]]);
    exit;
  }
  checkfile($target_dir);

  $UPLOAD_STATEMENT = "INSERT INTO products (name, price, quantity, description, discount_percent, image_link, category) VALUES (?, ?, ?, ?, ?, ?, ?)";
  $uploader = $dbh->prepare($UPLOAD_STATEMENT);
  $success = $uploader->execute([$name, $price, $quantity, $description, $discount, $remoteURL . basename($_FILES["fileToUpload"]["name"]), $category]);
  if (!$success) {
    http_response_code(500);
    echo json_encode(["error" => ["Server was unable to update database"]]);
    exit;
  } else {
    http_response_code(200);
    echo json_encode(["status" => "success: 200",]);
  }
}

/**
 * Returns the list of inventory products based on a searchable term as well and page limtis 
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON success or error message
 */
function handleGetItem($dbh)
{
  $category = filter_input(INPUT_GET, "category", FILTER_SANITIZE_SPECIAL_CHARS);
  $searchTerm = filter_input(INPUT_GET, "name", FILTER_SANITIZE_SPECIAL_CHARS);
  $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT) ?: 20;
  $start = filter_input(INPUT_GET, 'start', FILTER_VALIDATE_INT) ?: 0;

  // 1. The "Base" Query
  // We use "WHERE 1=1" so we can safely add "AND ..." later without checking if it's the first filter.
  $sql = "SELECT * FROM products WHERE 1=1";
  $params = [];

  // 2. Add Category Filter (Only if it exists)
  if ($category && $category !== 'All') {
    $sql .= " AND category = ?";
    $params[] = $category;
  }

  // 3. Add Search Filter (Only if it exists)
  if ($searchTerm) {
    $sql .= " AND name LIKE ?";
    $params[] = "%" . $searchTerm . "%";
  }

  // 4. Add Pagination (Always at the end)
  $sql .= " LIMIT ? OFFSET ?";

  // 5. Prepare and Bind
  $stmt = $dbh->prepare($sql);

  // Bind the dynamic filters first
  for ($i = 0; $i < count($params); $i++) {
    $stmt->bindValue($i + 1, $params[$i]);
  }

  // Bind the Integers (using the count to find the right position)
  $stmt->bindValue(count($params) + 1, (int)$limit, PDO::PARAM_INT);
  $stmt->bindValue(count($params) + 2, (int)$start, PDO::PARAM_INT);

  $success = $stmt->execute();

  if (!$success) {
    http_response_code(500);
    echo json_encode(["error" => "Database retrieval failed"]);
    exit;
  }

  $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
  http_response_code(200);
  // Don't double-encode the array! Just put the raw array in the response.
  echo json_encode([
    "status" => "success",
    "products" => $products
  ]);
}

function removeItem($dbh)
{
  $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);
  if ($id === null) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid ID"]);
    exit;
  }

  $stmt = $dbh->prepare("DELETE FROM products WHERE id = ?");
  $stmt->bindValue(1, $id, $id ? PDO::PARAM_INT : PDO::PARAM_NULL);
  // Execute MUST take an array
  if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["success" => "Item $id deleted"]);
  } else {
    http_response_code(500);
    echo json_encode(["error" => "Delete failed"]);
  }
}

function handleUpdateItem($dbh, $image_path)
{
// 1. Initialize and parse the PUT stream
$putData = [];
parse_str(file_get_contents("php://input"), $putData);

// 2. Filter the Product ID
$id = filter_var($putData["product_id"] ?? null, FILTER_VALIDATE_INT) ?: null;

// 3. Filter incoming fields - setting to null if filter_var returns false
$name = filter_var($putData["name"] ?? null, FILTER_SANITIZE_SPECIAL_CHARS) ?: null;

// For numbers, we check '!== false' so that 0 remains 0 and isn't turned into null
$f_price = filter_var($putData["price"] ?? null, FILTER_VALIDATE_FLOAT);
$price = ($f_price !== false) ? $f_price : null;

$f_quantity = filter_var($putData["quantity"] ?? null, FILTER_VALIDATE_INT);
$quantity = ($f_quantity !== false) ? $f_quantity : null;

$description = filter_var($putData["description"] ?? null, FILTER_SANITIZE_SPECIAL_CHARS) ?: null;

$f_discount = filter_var($putData["discount_percent"] ?? null, FILTER_VALIDATE_FLOAT);
$discount = ($f_discount !== false) ? $f_discount : null;

$category = filter_var($putData["category"] ?? null, FILTER_SANITIZE_SPECIAL_CHARS) ?: null;
    // 3. Strict Validation
    if ($id === null || $name === null || $price === null || $quantity === null || $description === null || $category === null || $discount === null) {
        http_response_code(400);
        echo json_encode([
            "error" => "Invalid Argument Passed In",
            "received" => [$id, $name, $price, $quantity, $description, $discount, $category]
        ]);
        exit;
    }

    // 4. Handle Image Upload (Optional for updates)
    // We check if a new file was actually sent; otherwise, we keep the old path
$imagePath = null;
if (isset($_FILES["fileToUpload"]) && $_FILES["fileToUpload"]["error"] === UPLOAD_ERR_OK) {
    checkfile($image_path);
    $imagePath = $config["remoteURL"] . basename($_FILES["fileToUpload"]["name"]);
}

$sql = "UPDATE products SET 
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            quantity = COALESCE(?, quantity),
            description = COALESCE(?, description),
            discount_percent = COALESCE(?, discount_percent),
            category = COALESCE(?, category)
        WHERE id = ?";
        $params = [$name, $price, $quantity, $description, $discount, $category, $imagePath, $id];

    $stmt = $dbh->prepare($sql);
    $success = $stmt->execute($params);

    if (!$success) {
        http_response_code(500);
        echo json_encode(["error" => "Server was unable to update database"]);
        exit;
    } else {
        http_response_code(200);
        echo json_encode(["status" => "success: 200"]);
    }
}
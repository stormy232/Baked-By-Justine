<?php
header('Content-Type: application/json');
// Parse without sections
ini_set('display_errors', '0');
$ini_array = parse_ini_file("db.ini");
try {
  $dbh = new PDO("mysql:host={$ini_array["db_url"]};dbname={$ini_array["db_name"]}", "{$ini_array["db_user"]}", "{$ini_array["db_pass"]}");
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "Error: Initalizing Database"]);
  exit;
}

switch ($_SERVER["REQUEST_METHOD"]) {
  case "DELETE":
    removeItem($dbh);
    break;
  case "GET":
    handleGetItem($dbh);
    break;
  case "POST":
    handlePostItem($dbh);
    break;
};


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
      echo json_encode(["success" => "File has been succesfully uploaded"]);
    } else {
      http_response_code(500);
      echo json_encode(["error" => "Server had an Issue Processing Image upload"]);
      $uploadOk = 0;
      exit;
    }
  }
}

function handlePostItem($dbh)
{
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
  $target_dir = $ini_array["img_path"];
  checkfile($target_dir);

  $UPLOAD_STATEMENT = "INSERT INTO products (name, price, quantity, description, discount, image_link, category) VALUES (?, ?, ?, ?, ?, ?, ?)";
  $uploader = $dbh->prepare($UPLOAD_STATEMENT);
  $success = $uploader->execute([$name, $price, $quantity, $description, $discount, $target_dir . basename($_FILES["fileToUpload"]["name"]), $category]);
  if (!$success) {
    http_response_code(500);
    echo json_encode(["error" => ["Server was unable to update database"]]);
    exit;
  } else {
    http_response_code(201);
    echo json_encode(["status" => "success: 201",]);
  }
}

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

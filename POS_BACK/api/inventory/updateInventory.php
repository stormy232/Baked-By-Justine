<?php
// Name: Vardaan Randev
// Date Created: April 20, 2026
// Description: API endpoint for modifying existing inventory records. Handles updating
//              product details (including optional image replacement) via POST,
//              and deleting a product by ID via GET.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once "../config.php";

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        handleUpdateItem($dbh); 
        break;
    case "GET":
        removeItem($dbh);
        break;
}

/**
 * Updates an existing product record in the database with new field values.
 * Optionally replaces the product image if a new file is uploaded.
 * Uses COALESCE to preserve existing values for any fields not provided.
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON success or error message
 */
function handleUpdateItem($dbh)
{
    // 1. Filter incoming fields directly from POST
    $id = filter_input(INPUT_POST, 'product_id', FILTER_VALIDATE_INT);
    
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
    
    $f_price = filter_input(INPUT_POST, 'price', FILTER_VALIDATE_FLOAT);
    $price = ($f_price !== false) ? $f_price : null;

    $f_quantity = filter_input(INPUT_POST, 'quantity', FILTER_VALIDATE_INT);
    $quantity = ($f_quantity !== false) ? $f_quantity : null;

    $description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_SPECIAL_CHARS);

    $f_discount = filter_input(INPUT_POST, 'discount_percent', FILTER_VALIDATE_FLOAT);
    $discount = ($f_discount !== false) ? $f_discount : null;

    $category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_SPECIAL_CHARS);

    // 2. Strict Validation
    // We check if required fields are null or false
    if ($id === null || $id === false || $name === null || $price === null || $quantity === null) {
        http_response_code(400);
        echo json_encode([
            "error" => "Required fields missing or invalid",
            "received" => ["id" => $id, "name" => $name, "price" => $price]
        ]);
        exit;
    }

    // 3. Handle Image Upload
    $imagePath = null;
    if (isset($_FILES["fileToUpload"]) && $_FILES["fileToUpload"]["error"] === UPLOAD_ERR_OK) {
        // Assuming checkfile() is a custom function in your config or helper
        // and $config is globally available from config.php
        global $config; 
        $targetDir = "../uploads/"; // Adjust as needed
        $fileName = basename($_FILES["fileToUpload"]["name"]);
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $targetFile)) {
            $imagePath = $config["remoteURL"] . $fileName;
        }
    }

    // 4. The SQL Update
    // COALESCE(?, column_name) keeps the old value if the new one is null
    $sql = "UPDATE products SET 
                name = COALESCE(?, name),
                price = COALESCE(?, price),
                quantity = COALESCE(?, quantity),
                description = COALESCE(?, description),
                discount_percent = COALESCE(?, discount_percent),
                category = COALESCE(?, category),
                image_link = COALESCE(?, image_link)
            WHERE product_id = ?";

    $params = [$name, $price, $quantity, $description, $discount, $category, $imagePath, $id];

    try {
        $stmt = $dbh->prepare($sql);
        $success = $stmt->execute($params);

        if ($success) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Item updated successfully"]);
        } else {
            throw new Exception("Database update failed");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

/**
 * Deletes a product from the database by its ID.
 *
 * @param PDO $dbh The active PDO database connection
 * @return void Outputs a JSON success or error message
 */
function removeItem($dbh)
{
  $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);
  if ($id === null) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid ID"]);
    exit;
  }

  $stmt = $dbh->prepare("DELETE FROM products WHERE product_id = ?");
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
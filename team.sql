-- 1. Products Table
-- Stores the "Master List" of what you sell
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 0, -- Current stock level
    description TEXT,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    image_link VARCHAR(255),
    category VARCHAR(100)
);

-- 2. Users Table
-- For Employees and Owners (Internal Staff)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    privilege ENUM('employee', 'owner') DEFAULT 'employee'
);

-- 3. Delivery Table (Order Header)
-- Tracks the WHO, WHEN, and STATUS. No login required for customers.
CREATE TABLE IF NOT EXISTS delivery (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL,
    order_status ENUM('pending', 'preparing', 'finished') DEFAULT 'pending',
    est_prep_time VARCHAR(100), -- e.g., "30 mins"
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Table (Order Details)
-- This is the "Array" of products for each order.
-- This is what the kitchen staff will look at to see WHAT to bake.
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- Keeps history accurate if prices change later
    
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES delivery(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

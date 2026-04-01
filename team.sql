-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 0,
    description TEXT,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00, -- Specifically for % promotions
    image_link VARCHAR(255),
    category VARCHAR(100)
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Storing hashed passwords, never plain text
    privilege ENUM('customer', 'employee', 'owner') DEFAULT 'customer'
);

-- 3. Delivery (Orders) Table
CREATE TABLE IF NOT EXISTS delivery (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    est_prep_time VARCHAR(100), -- e.g., "20-30 minutes"
    order_status ENUM('pending', 'preparing', 'shipped', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Links to other tables
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

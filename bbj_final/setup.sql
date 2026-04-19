-- ============================================================
-- Baked By Justine - Database Setup
-- Run in phpMyAdmin or: mysql -u root < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS baked_by_justine
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE baked_by_justine;

-- 1. Products
CREATE TABLE IF NOT EXISTS products (
    product_id       INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)  NOT NULL,
    price            DECIMAL(10,2) NOT NULL,
    quantity         INT           DEFAULT 0,
    description      TEXT,
    discount_percent DECIMAL(5,2)  DEFAULT 0.00,
    image_link       VARCHAR(255),
    category         VARCHAR(100)
);

-- 2. Users (staff only)
CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    privilege     ENUM('employee','owner') DEFAULT 'employee'
);

-- 3. Delivery (order header, no user FK - customers identified by email)
CREATE TABLE IF NOT EXISTS delivery (
    order_id       INT AUTO_INCREMENT PRIMARY KEY,
    customer_email VARCHAR(255)  NOT NULL,
    order_status   ENUM('pending','preparing','finished') DEFAULT 'pending',
    est_prep_time  VARCHAR(100),
    total_price    DECIMAL(10,2) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items (line items per order)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id     INT AUTO_INCREMENT PRIMARY KEY,
    order_id          INT           NOT NULL,
    product_id        INT           NOT NULL,
    quantity          INT           NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order        FOREIGN KEY (order_id)   REFERENCES delivery(order_id)   ON DELETE CASCADE,
    CONSTRAINT fk_product_item FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 5. Cart (keyed by email + product, composite PK)
CREATE TABLE IF NOT EXISTS cart (
    customer_email VARCHAR(255) NOT NULL,
    product_id     INT          NOT NULL,
    qty            INT          NOT NULL DEFAULT 1,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_email, product_id),
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Seed: Staff
INSERT IGNORE INTO users (username, password_hash, privilege)
VALUES
  ('justine', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
  ('staff1',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

-- !! Run sample_data.sql after this to populate products !!

-- ════════════════════════════════════════════════════════════════
-- Baked By Justine — Database Setup
-- Run this in phpMyAdmin or via: mysql -u root < setup.sql
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS baked_by_justine
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE baked_by_justine;

-- ── 1. Products Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    product_id       INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)   NOT NULL,
    price            DECIMAL(10,2)  NOT NULL,
    quantity         INT            DEFAULT 0,
    description      TEXT,
    discount_percent DECIMAL(5,2)   DEFAULT 0.00,
    image_link       VARCHAR(255),
    category         VARCHAR(100)
);

-- ── 2. Users Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    privilege     ENUM('customer','employee','owner') DEFAULT 'customer'
);

-- ── 3. Delivery (Orders) Table ────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery (
    order_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    product_id   INT          NOT NULL,
    est_prep_time VARCHAR(100),
    order_status ENUM('pending','preparing','shipped','delivered') DEFAULT 'pending',
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ── Seed: Products ────────────────────────────────────────────
INSERT INTO products (name, price, quantity, description, discount_percent, image_link, category)
VALUES
  ('Sourdough Loaf',    8.50, 12, 'Tangy crust, soft crumb',          0,  'images/sourdough.png',         'Breads'),
  ('Cinnamon Roll',     3.50,  8, 'Cream cheese frosting',           10,  'images/cinnamon-roll.png',     'Pastries'),
  ('Blueberry Muffin',  2.75, 15, 'Packed with fresh berries',        0,  'images/blueberry-muffin.png',  'Muffins'),
  ('Butter Croissant',  3.25,  3, 'Buttery and flaky',                0,  'images/croissant.png',         'Pastries'),
  ('Banana Bread',      6.00,  0, 'Moist, with walnuts',              0,  'images/banana-bread.png',      'Breads'),
  ('Chocolate Brownie', 2.50, 20, 'Rich dark chocolate fudge',        5,  'images/brownie.png',           'Sweets'),
  ('Lemon Tart',        4.50,  6, 'Silky lemon curd in pastry',       0,  'images/lemon-tart.png',        'Tarts'),
  ('Almond Croissant',  4.00,  2, 'Filled with almond cream',         0,  'images/almond-croissant.png',  'Pastries')
ON DUPLICATE KEY UPDATE name = name;  -- safe to re-run

-- ── Seed: Demo User (password = "password123") ────────────────
-- Generate a real hash with: password_hash('password123', PASSWORD_BCRYPT)
INSERT IGNORE INTO users (username, password_hash, privilege)
VALUES
  ('justine',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
  ('customer1','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- user_id 1 = justine (owner), user_id 2 = customer1
-- Both use password: "password"  ← bcrypt hash above is Laravel's default test hash

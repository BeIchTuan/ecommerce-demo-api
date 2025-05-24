-- 1. DROP ALL TABLES IF EXIST
DROP TABLE IF EXISTS 
  order_vouchers,
  order_items,
  orders,
  user_vouchers,
  vouchers,
  product_variants,
  products,
  stores,
  categories,
  addresses,
  users
CASCADE;

-- 2. USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer', 'seller')) DEFAULT 'customer',
  password VARCHAR(255),
  phone VARCHAR(20),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. STORES
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- 4. ADDRESSES (multi-use for both users & stores)
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  store_id INT REFERENCES stores(id) ON DELETE CASCADE,
  province VARCHAR(100),
  district VARCHAR(100),
  commune VARCHAR(100),
  address_detail TEXT,
  housing_type VARCHAR(50),
  CHECK (
    (user_id IS NOT NULL AND store_id IS NULL) OR
    (user_id IS NULL AND store_id IS NOT NULL)
  )
);

-- 5. CATEGORIES
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  image_url TEXT
);

-- 6. PRODUCTS
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT REFERENCES categories(id),
  store_id INT REFERENCES stores(id),
  image_url TEXT,
  description TEXT
);

-- 7. PRODUCT VARIANTS
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  size VARCHAR(20),
  color VARCHAR(50),
  price INT NOT NULL,
  quantity INT DEFAULT 0,
  UNIQUE(product_id, color, size)
);

-- 8. VOUCHERS
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percent INT,
  expiration_date DATE
);

-- 9. USER-VOUCHERS
CREATE TABLE user_vouchers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  voucher_id INT REFERENCES vouchers(id),
  UNIQUE(user_id, voucher_id)
);

-- 10. ORDERS
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  shipping_address TEXT, 
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount INT,
  shipping_fee INT,
  payment_method VARCHAR(10) CHECK (payment_method IN ('cash', 'momo')),
  payment_status VARCHAR(10) CHECK (payment_status IN ('pending', 'paid')),
  shipping_status VARCHAR(20) CHECK (shipping_status IN ('pending', 'shipped', 'delivered'))
);

-- 11. ORDER ITEMS
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_variant_id INT REFERENCES product_variants(id),
  quantity INT,
  price INT
);

-- 12. ORDER-VOUCHERS
CREATE TABLE order_vouchers (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  voucher_id INT REFERENCES vouchers(id),
  UNIQUE(order_id, voucher_id)
);

-- 13. INDEXES

-- USERS
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ADDRESSES
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_store_id ON addresses(store_id);
CREATE INDEX idx_addresses_location ON addresses(province, district);

-- PRODUCTS
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_store_id ON products(store_id);

-- PRODUCT VARIANTS
CREATE INDEX idx_product_variant_quantity ON product_variants(quantity);

-- VOUCHERS
CREATE INDEX idx_vouchers_expiration_date ON vouchers(expiration_date);

-- ORDERS
CREATE INDEX idx_orders_user_id_date ON orders(user_id, order_date);

-- ORDER ITEMS
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(product_variant_id);

-- Add user
INSERT INTO users (name, email, phone, gender)
VALUES ('assessment', 'gu@gmail.com', '328355333', NULL)
ON CONFLICT (email) DO NOTHING; 

WITH user_row AS (
  SELECT id FROM users WHERE email = 'gu@gmail.com'
)
-- Add address for user
INSERT INTO addresses (user_id, province, district, commune, address_detail, housing_type)
SELECT id, 'Bắc Kạn', 'Ba Bể', 'Phúc Lộc', '73 tân hoà 2', 'nhà riêng'
FROM user_row
ON CONFLICT DO NOTHING;

-- Add category
INSERT INTO categories (name, image_url)
VALUES ('Footwear', 'https://example.com/images/footwear.jpg')
ON CONFLICT (name) DO NOTHING
RETURNING id;

INSERT INTO categories (name, image_url) VALUES 
('Điện thoại', 'https://example.com/images/dien-thoai.jpg'),
('Máy tính xách tay', 'https://example.com/images/may-tinh-xach-tay.jpg'),
('Máy tính bàn', 'https://example.com/images/may-tinh-ban.jpg'),
('Thiết bị âm thanh', 'https://example.com/images/thiet-bi-am-thanh.jpg'),
('Phụ kiện điện thoại', 'https://example.com/images/phu-kien-dien-thoai.jpg'),
('Thời trang nam', 'https://example.com/images/thoi-trang-nam.jpg'),
('Thời trang nữ', 'https://example.com/images/thoi-trang-nu.jpg'),
('Đồ gia dụng', 'https://example.com/images/do-gia-dung.jpg'),
('Sách', 'https://example.com/images/sach.jpg'),
('Thể thao & Dã ngoại', 'https://example.com/images/the-thao-da-ngoai.jpg');

-- Add store
INSERT INTO stores (name)
VALUES ('Main Store')
ON CONFLICT (name) DO NOTHING
RETURNING id;

-- Add product
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('KAPPA Women''s Sneakers', 1, 1, 'https://example.com/images/kappa_yellow_36.jpg', 'Giày thể thao nữ màu vàng size 36')
RETURNING id;

INSERT INTO product_variants (product_id, size, color, price, quantity)
VALUES (1, '36', 'yellow', 980000, 5)
ON CONFLICT (product_id, color, size) DO UPDATE SET quantity = EXCLUDED.quantity, price = EXCLUDED.price;

-- Insert Order
WITH user_row AS (
  SELECT id FROM users WHERE email = 'gu@gmail.com'
),
product_variant_row AS (
  SELECT id, price FROM product_variants
  WHERE color = 'yellow' AND size = '36'
    AND product_id = (
      SELECT id FROM products WHERE name = 'KAPPA Women''s Sneakers'
    )
),
new_order AS (
  INSERT INTO orders (user_id, shipping_address, total_amount)
  VALUES (
    (SELECT id FROM user_row),
    'Bắc Kạn, Ba Bể, Phúc Lộc, 73 tân hoà 2, nhà riêng',
    (SELECT price FROM product_variants)
  )
  RETURNING id
)
-- Insert order item
INSERT INTO order_items (order_id, product_variant_id, quantity, price)
VALUES (
  (SELECT id FROM new_order),
  (SELECT id FROM product_variant_row),
  1,
  (SELECT price FROM product_variant_row)
);

-- Update stock quantity 
UPDATE product_variants
SET quantity = quantity - 1
WHERE id = (
  SELECT id FROM product_variants
);

--Result
SELECT
  o.id AS order_id,
  u.id,
  u.name,
  o.order_date,
  o.total_amount,
  oi.quantity,
  oi.price,
  pv.color,
  pv.size,
  p.name AS product_name,
  o.shipping_address
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN product_variants pv ON oi.product_variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE u.email = 'gu@gmail.com'
ORDER BY o.order_date DESC;

-- Calculate the average order value for each month in current year
SELECT
  DATE_TRUNC('month', order_date) AS month,
  ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- Query to calculate the churn rate of customers.
WITH active_before AS (
  SELECT DISTINCT user_id
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
    AND order_date < CURRENT_DATE - INTERVAL '6 months'
),
active_recent AS (
  SELECT DISTINCT user_id
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '6 months'
)
SELECT
  ROUND(
    100.0 * COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM active_before), 0),
    2
  ) AS churn_rate_percentage
FROM active_before
WHERE user_id NOT IN (SELECT user_id FROM active_recent);

-- PRODUCTS & VARIANTS INSERT
-- Product 1 - Footwear
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Nike Air Max', 1, 1, 'https://example.com/images/nike-air-max.jpg', 'Comfortable running shoes');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(1, '42', 'Black', 2500000, 10),
(1, '43', 'White', 2550000, 5);

-- Product 2 - Footwear
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Adidas Ultraboost', 1, 1, 'https://example.com/images/adidas-ultraboost.jpg', 'Running shoes with boost technology');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(2, '42', 'White', 2800000, 8),
(2, '43', 'Black', 2850000, 9);

-- Product 3 - Điện thoại
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('iPhone 13 Pro', 2, 1, 'https://example.com/images/iphone-13-pro.jpg', 'Apple smartphone with A15 chip');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(3, '128GB', 'Silver', 24000000, 8),
(3, '256GB', 'Graphite', 27000000, 6);

-- Product 4 - Điện thoại
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Samsung Galaxy S23', 2, 1, 'https://example.com/images/galaxy-s23.jpg', 'Flagship Android smartphone');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(4, '128GB', 'Green', 21000000, 7);

-- Product 5 - Máy tính xách tay
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('MacBook Air M2', 3, 1, 'https://example.com/images/macbook-air-m2.jpg', 'Thin and light laptop from Apple');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(5, '13"', 'Silver', 30000000, 4),
(5, '13"', 'Space Gray', 30000000, 4);

-- Product 6 - Máy tính xách tay
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('ASUS ZenBook 14', 3, 1, 'https://example.com/images/zenbook14.jpg', 'Lightweight business laptop');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(6, '14"', 'Blue', 19000000, 6);

-- Product 7 - Máy tính bàn
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Dell XPS Desktop', 4, 1, 'https://example.com/images/dell-xps-desktop.jpg', 'High performance desktop PC');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(7, 'i7/16GB/512GB', 'Black', 28000000, 3);

-- Product 8 - Máy tính bàn
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('HP Pavilion Tower', 4, 1, 'https://example.com/images/hp-pavilion.jpg', 'Entry level desktop tower');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(8, 'i5/8GB/256GB', 'Silver', 16000000, 5);

-- Product 9 - Thiết bị âm thanh
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Sony WH-1000XM4', 5, 1, 'https://example.com/images/sony-wh1000xm4.jpg', 'Noise cancelling headphones');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(9, 'One Size', 'Black', 6000000, 7);

-- Product 10 - Thiết bị âm thanh
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('JBL Flip 6', 5, 1, 'https://example.com/images/jbl-flip6.jpg', 'Portable waterproof speaker');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(10, 'One Size', 'Blue', 2500000, 10);

-- Product 11 - Phụ kiện điện thoại
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Ốp lưng iPhone', 6, 1, 'https://example.com/images/op-lung.jpg', 'Ốp lưng silicon bảo vệ điện thoại');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(11, 'iPhone 13', 'Blue', 150000, 20),
(11, 'iPhone 13', 'Pink', 150000, 15);

-- Product 12 - Phụ kiện điện thoại
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Cáp sạc USB-C', 6, 1, 'https://example.com/images/cap-sac.jpg', 'Cáp sạc nhanh 1m');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(12, '1m', 'White', 120000, 30);

-- Product 13 - Thời trang nam
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Áo sơ mi nam', 7, 1, 'https://example.com/images/ao-so-mi-nam.jpg', 'Áo sơ mi cotton thoáng mát');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(13, 'M', 'White', 250000, 10),
(13, 'L', 'Black', 250000, 12);

-- Product 14 - Thời trang nam
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Quần jean nam', 7, 1, 'https://example.com/images/quan-jean.jpg', 'Quần jean thời trang nam tính');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(14, '32', 'Blue', 350000, 9);

-- Product 15 - Thời trang nữ
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Váy nữ thời trang', 8, 1, 'https://example.com/images/vay-nu.jpg', 'Váy nữ phong cách Hàn Quốc');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(15, 'S', 'Red', 300000, 5),
(15, 'M', 'Blue', 300000, 6);

-- Product 16 - Thời trang nữ
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Áo khoác nữ', 8, 1, 'https://example.com/images/ao-khoac-nu.jpg', 'Áo khoác giữ ấm mùa đông');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(16, 'M', 'Black', 450000, 7);

-- Product 17 - Đồ gia dụng
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Nồi cơm điện Toshiba', 9, 1, 'https://example.com/images/noi-com.jpg', 'Nồi cơm điện dung tích lớn');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(17, '1.8L', 'White', 1200000, 7);

-- Product 18 - Đồ gia dụng
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Bếp từ Electrolux', 9, 1, 'https://example.com/images/bep-tu.jpg', 'Bếp từ đôi tiết kiệm điện');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(18, '2 bếp', 'Black', 3200000, 4);

-- Product 19 - Sách
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Sách luyện thi TOEIC', 10, 1, 'https://example.com/images/sach-toeic.jpg', 'Sách học và luyện thi TOEIC');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(19, 'Standard', 'N/A', 180000, 30);

-- Product 20 - Thể thao & Dã ngoại
INSERT INTO products (name, category_id, store_id, image_url, description)
VALUES ('Balo du lịch chống nước', 11, 1, 'https://example.com/images/balo.jpg', 'Balo tiện lợi cho chuyến đi xa');
INSERT INTO product_variants (product_id, size, color, price, quantity) VALUES
(20, '35L', 'Gray', 550000, 11);










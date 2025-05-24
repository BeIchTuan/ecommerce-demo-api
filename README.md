# 🛒 E-Commerce API

![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)
![Redis](https://img.shields.io/badge/Redis-6.x-red)

A modern RESTful API for an e-commerce platform built with **Node.js**, **Express**, **PostgreSQL**, and **Redis**. This project supports user authentication with JWT, role-based authorization (admin/customer), product management, order processing with payment integration, and caching for performance optimization. 

---

## ✨ Features

- **🔒 User Authentication & Authorization**
  - Register and login with JWT tokens.
  - Role-based access: `admin` for managing categories, `customer` for placing orders.
- **🛍️ Product Management**
  - Browse products by category or search with filters (e.g., price, category).
  - Supports product variants (size, color, price, quantity).
- **📦 Order Processing**
  - Create orders with shipping details, payment methods (`cash`, `momo`), and voucher discounts.
  - Tracks payment status (`pending`, `paid`) and shipping status (`pending`, `shipped`, `delivered`).
  - Send email confirmation after ordering.
- **⚡ Performance Optimization**
  - Redis caching for frequently accessed data (e.g., categories, products).
- **💾 Database**
  - PostgreSQL for robust data storage (users, products, orders, vouchers).

---

## 🛠️ Tech Stack

| Technology       | Version  | Purpose                     |
|------------------|----------|-----------------------------|
| Node.js          | 14+      | Backend runtime             |
| Express          | 4.x      | Web framework               |
| PostgreSQL       | 13+      | Database                    |
| Redis            | 6.x      | Caching                     |
| JWT              | 8.x      | Authentication              |
| bcrypt           | 5.x      | Password hashing            |
| express-validator| 6.x      | Input validation            |

---

## 📂 Project Structure

```plaintext
ecommerce-api/
├── config/
│   └── db.js                 # PostgreSQL connection
│   └── redis.js              # Redis connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── categoryController.js # Category management
│   ├── productController.js  # Product management
│   └── orderController.js    # Order processing
├── middleware/
│   └── authMiddleware.js     # JWT & role middleware
│   └── validation.js         # validation middleware
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── categoryRoutes.js     # /api/categories
│   ├── productRoutes.js      # /api/products
│   ├── orderRoutes.js        # /api/orders
│   └── index.js              # Route aggregator
├── services/
│   ├── authService.js        # Auth business logic
│   ├── categoryService.js    # Category logic
│   ├── productService.js     # Product logic
│   ├── orderService.js       # Order logic
├── .env                      # Environment variables
├── package.json              # Dependencies
├── package-lock.json         # Dependency lock
└── server.js                 # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **PostgreSQL** (if running locally)
- **Redis** (if running locally)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/BeIchTuan/ecommerce-api.git
   cd ecommerce-api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory:

   ```env
   DB_USER=your_postgres_user
   DB_HOST=postgres
   DB_NAME=ecommerce_db
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   REDIS_URL=redis://redis:6379
   ```

### Running Locally

1. Ensure PostgreSQL and Redis are running.
2. Start the application:

   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Authentication

- **POST /api/auth/register**
  - **Description**: Register a new customer.
  - **Body**: `{ "name", "email", "phone", "gender", "role": "customer", "password" }`
  - **Response**: `201` with user details.

- **POST /api/auth/login**
  - **Description**: Login to obtain a JWT token.
  - **Body**: `{ "email", "password" }`
  - **Response**: `200` with `{ token, user }`.

### Categories 

- **GET /api/categories**
  - **Description**: Retrieve all categories (cached in Redis).
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `200` with category list.

### Products

- **GET /api/categories/:categoryId/products**
  - **Description**: Get products by category with pagination.
  - **Query**: `?page=1&limit=10`
  - **Response**: `200` with products and pagination info.

- **GET /api/products/search**
  - **Description**: Search products with filters.
  - **Query**: `?q=keyword&categoryId=1&minPrice=100&maxPrice=1000&page=1&limit=10`
  - **Response**: `200` with filtered products.

### Orders (Customer Only)

- **POST /api/orders**
  - **Description**: Create a new order with payment processing.
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ "shippingAddress", "items", "voucherCodes", "paymentDetails", "shipping_fee", "payment_method" }`
  - **Response**: `201` with order details.

---

## 📬 Contact

For issues or inquiries, open a GitHub issue or contact [tuanbeich@gmail.com].

---

⭐ **Star this repository if you find it useful!**

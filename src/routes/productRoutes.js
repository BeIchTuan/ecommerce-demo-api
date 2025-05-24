const express = require('express');
const { param, query } = require('express-validator');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

// Search products 
router.get(
  '/search',
  [
    query('q').optional().isString().trim(),
    query('categoryId').optional().isInt().toInt(),
    query('storeId').optional().isInt().toInt(),
    query('minPrice').optional().isInt({ min: 0 }).toInt(),
    query('maxPrice').optional().isInt({ min: 0 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
  ],
  validate,
  productController.searchProducts
);

// Fetch products by category
router.get(
  '/category/:categoryId',
  [
    param('categoryId').isInt().toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
  ],
  validate,
  productController.getProductsByCategory
);

module.exports = router;
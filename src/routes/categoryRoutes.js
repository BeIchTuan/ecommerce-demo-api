const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// GET all categories (public)
router.get('/', categoryController.getAllCategories);

module.exports = router;
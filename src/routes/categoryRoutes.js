const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET all categories
router.get('/', (req, res, next) => {
    categoryController.getAllCategories(req, res, next);
});

module.exports = router;
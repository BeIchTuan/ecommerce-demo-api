const express = require('express');
const categoryRoutes = require('./categoryRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

module.exports = router;
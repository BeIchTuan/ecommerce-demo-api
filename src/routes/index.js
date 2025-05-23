const express = require('express');
const categoryRoutes = require('./categoryRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
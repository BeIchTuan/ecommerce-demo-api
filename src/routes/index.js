const express = require('express');
const categoryRoutes = require('./categoryRoutes');

const router = express.Router();

router.use('/categories', categoryRoutes);

module.exports = router;
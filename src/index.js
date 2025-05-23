const express = require('express');
const morgan = require('morgan');
const { Pool } = require('pg');
const { body, param, query, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Middleware for error handling
const handleErrors = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Error handling middleware
app.use(handleErrors);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
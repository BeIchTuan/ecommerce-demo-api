const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const pool = require('./config/db');
require('dotenv').config();
const apiRoutes = require('./routes/index');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.set('db', pool);

// Middleware for error handling
const handleErrors = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(handleErrors);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
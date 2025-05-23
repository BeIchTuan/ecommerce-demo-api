const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isString().trim().notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Register
router.post(
  '/register',
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),    body('phone').optional().isString().trim().withMessage('Phone must be a string'),
    body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be " male" or "female"'),
    body('role').isIn(['customer', 'seller']).withMessage('Role must be either "customer" or "seller"'),
    body('password').isString().trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.register
);

module.exports = router;
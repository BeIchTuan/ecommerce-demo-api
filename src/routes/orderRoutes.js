const express = require('express');
const orderController = require('../controllers/orderController');
const validate = require('../middlewares/validateMiddleware');
const {authMiddleware} = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const router = express.Router();

// Create order (customer only)
router.post(
  '/',
  authMiddleware(['customer']),
  [
    // Shipping Address validation
    body('shippingAddress').isObject().withMessage('Shipping address must be an object'),
    body('shippingAddress.province').isString().trim().notEmpty().withMessage('Province is required'),
    body('shippingAddress.district').isString().trim().notEmpty().withMessage('District is required'),
    body('shippingAddress.commune').isString().trim().notEmpty().withMessage('Commune is required'),
    body('shippingAddress.address_detail').isString().trim().notEmpty().withMessage('Address detail is required'),
    body('shippingAddress.housing_type').isString().trim().notEmpty().withMessage('Housing type is required'),
    
    // Order items validation
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productVariantId').isInt().withMessage('Product variant ID must be an integer'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
    // Voucher codes validation
    body('voucherCodes').optional().isArray().withMessage('Voucher codes must be an array'),
    body('voucherCodes.*').optional().isString().trim().withMessage('Voucher code must be a string'),
    
    // Payment validation
    body('payment_method').isIn(['cash', 'momo']).withMessage('Payment method must be "cash" or "momo"'),
    body('shipping_fee').isInt({ min: 0 }).withMessage('Shipping fee must be a non-negative integer'),
    
    // MoMo payment details validation (only required if payment method is momo)
    body('paymentDetails')
      .if(body('payment_method').equals('momo'))
      .isObject()
      .withMessage('Payment details are required for MoMo payment'),
    body('paymentDetails.transactionId')
      .if(body('payment_method').equals('momo'))
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Transaction ID is required for MoMo payment'),
    body('paymentDetails.phoneNumber')
      .if(body('payment_method').equals('momo'))
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Phone number is required for MoMo payment')
  ],
  validate,
  orderController.createOrder
);

module.exports = router;
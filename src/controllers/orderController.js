const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  const { shippingAddress, items, voucherCodes = [], paymentDetails, shipping_fee, payment_method } = req.body;

  try {
    const result = await orderService.createOrder(req.app.get('db'), {
      userId: req.id, 
      shippingAddress,
      items,
      voucherCodes,
      paymentDetails,
      shipping_fee,
      payment_method,
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: result
    });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ 
        status: 'error',
        message: err.message 
      });
    } else if (err.message.includes('Insufficient quantity')) {
      return res.status(409).json({ 
        status: 'error',
        message: err.message 
      });
    } else if (err.message.includes('Invalid MoMo payment details')) {
      return res.status(400).json({ 
        status: 'error',
        message: err.message 
      });
    }
    next(err);
  }
}

module.exports = {
  createOrder,
};
const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(protect);

// Create Razorpay payment order (validate cart + stock + compute total)
router.post('/create-payment-order', createPaymentOrder);

// Verify Razorpay payment signature and confirm order
router.post('/verify-payment', verifyPayment);

// Get current user's orders (newest first)
router.get('/', getMyOrders);

// Get single order (ownership enforced)
router.get('/:id', getOrderById);

// Bonus: update order status progression
router.patch('/:id/status', updateOrderStatus);

module.exports = router;

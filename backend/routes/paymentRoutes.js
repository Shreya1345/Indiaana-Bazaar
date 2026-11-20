const express = require('express');
const {
  createRazorpayOrder,
  createTestOrder,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/order', protect, createRazorpayOrder);
router.post('/test-order', protect, createTestOrder);
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;

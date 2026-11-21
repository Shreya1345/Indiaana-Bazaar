const express = require('express');
const {
  createRazorpayOrder,
  createCodOrder,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/order', protect, createRazorpayOrder);
router.post('/cod-order', protect, createCodOrder);
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;

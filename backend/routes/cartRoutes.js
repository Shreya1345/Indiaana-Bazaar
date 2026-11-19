const express = require('express');
const { getCart, replaceCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .put(protect, replaceCart)
  .delete(protect, clearCart);

module.exports = router;

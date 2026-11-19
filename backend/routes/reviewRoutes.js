const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/product/:productId', getReviews);
router.post('/product/:productId', protect, createReview);

module.exports = router;

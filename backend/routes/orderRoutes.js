const express = require('express');
const { getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/').get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;

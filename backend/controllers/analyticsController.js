const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });

    const orders = await Order.find({}).select('totalAmount currency').lean();
    const revenueInr = orders.reduce((total, order) => total + order.totalAmount, 0);

    res.json({ totalOrders, totalProducts, totalUsers, revenueInr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };

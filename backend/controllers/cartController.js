const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).lean();
    return res.json({ items: cart?.items || [] });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load cart.' });
  }
};

const replaceCart = async (req, res) => {
  try {
    if (!Array.isArray(req.body.items)) {
      return res.status(400).json({ message: 'Cart items are required.' });
    }

    const quantities = new Map();
    for (const item of req.body.items) {
      const productId = String(item.productId || '');
      const qty = Number(item.qty);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Cart contains an invalid item.' });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + qty);
    }

    const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean();
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    if (productsById.size !== quantities.size) {
      return res.status(400).json({ message: 'A product in the cart is no longer available.' });
    }

    const items = [];
    for (const [productId, qty] of quantities) {
      const product = productsById.get(productId);
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} units of ${product.name} are available.` });
      }
      items.push({ productId, qty });
    }

    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, items },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save cart.' });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return res.json({ items: [] });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to clear cart.' });
  }
};

module.exports = { getCart, replaceCart, clearCart };

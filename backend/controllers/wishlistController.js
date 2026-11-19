const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).lean();
    const productIds = wishlist?.productIds || [];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    return res.json({
      products: productIds.map((id) => productMap.get(String(id))).filter(Boolean)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load wishlist.' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const productId = String(req.params.productId || '');
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product.' });
    }
    if (!await Product.exists({ _id: productId })) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ userId: req.user._id, productIds: [] });

    const exists = wishlist.productIds.some((id) => String(id) === productId);
    wishlist.productIds = exists
      ? wishlist.productIds.filter((id) => String(id) !== productId)
      : [...wishlist.productIds, productId];
    await wishlist.save();

    return res.json({ isWishlisted: !exists, productIds: wishlist.productIds.map(String) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update wishlist.' });
  }
};

module.exports = { getWishlist, toggleWishlist };

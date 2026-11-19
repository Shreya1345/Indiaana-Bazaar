const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: '$productId', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratings: stats[0]?.average || 0,
    numReviews: stats[0]?.count || 0
  });
};

const getReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product.' });
    }
    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load reviews.' });
  }
};

const createReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product.' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!comment) {
      return res.status(400).json({ message: 'Review comment is required.' });
    }
    if (!await Product.exists({ _id: productId })) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const purchased = await Order.exists({
      userId: req.user._id,
      'items.productId': productId
    });
    if (!purchased) {
      return res.status(403).json({ message: 'Only customers who purchased this product can review it.' });
    }
    if (await Review.findOne({ productId, userId: req.user._id })) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    await Review.create({
      productId,
      userId: req.user._id,
      name: req.user.name,
      rating,
      comment
    });
    await updateProductRating(productId);

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    return res.status(201).json(reviews);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    return res.status(500).json({ message: 'Unable to add review.' });
  }
};

module.exports = { getReviews, createReview };

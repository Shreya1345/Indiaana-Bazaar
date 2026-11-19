const mongoose = require('mongoose');
const Product = require('../models/Product');

const roundToCents = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

const createCartQuote = async (items, currency) => {
  if (currency !== 'INR') {
    const error = new Error('Unsupported currency.');
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Your cart is empty.');
    error.statusCode = 400;
    throw error;
  }
  const quantities = new Map();
  for (const item of items) {
    const productId = String(item.productId || '');
    const qty = Number(item.qty);
    if (!mongoose.isValidObjectId(productId) || !Number.isInteger(qty) || qty < 1) {
      const error = new Error('Your cart contains an invalid item.');
      error.statusCode = 400;
      throw error;
    }
    quantities.set(productId, (quantities.get(productId) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } })
    .select('_id price stock')
    .lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));

  if (productsById.size !== quantities.size) {
    const error = new Error('A product in your cart is no longer available.');
    error.statusCode = 400;
    throw error;
  }

  let totalCents = 0;
  const pricedItems = [];
  for (const [productId, qty] of quantities) {
    const product = productsById.get(productId);
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new Error('A product has an invalid price.');
    }
    if (product.stock < qty) {
      const error = new Error('A product in your cart does not have enough stock.');
      error.statusCode = 400;
      throw error;
    }

    const price = roundToCents(product.price);
    totalCents += Math.round(price * 100) * qty;
    pricedItems.push({ productId, qty, price });
  }

  return {
    items: pricedItems,
    totalAmount: totalCents / 100,
    currency: 'INR'
  };
};

module.exports = { createCartQuote };

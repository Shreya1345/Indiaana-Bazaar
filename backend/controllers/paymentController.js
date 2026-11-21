const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const PaymentAttempt = require('../models/PaymentAttempt');
const { createCartQuote } = require('../services/cartPricing');

const normalizeAddress = (address) => {
  const fields = ['fullName', 'street', 'city', 'postalCode', 'country'];
  const normalized = {};
  for (const field of fields) {
    normalized[field] = typeof address?.[field] === 'string' ? address[field].trim() : '';
  }
  if (Object.values(normalized).some((value) => !value)) {
    const error = new Error('Complete the shipping address before placing your order.');
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const savePaidOrder = async ({ attempt, address, paymentId, paymentProvider }) => {
  const existingOrder = await Order.findOne({ paymentId });
  if (existingOrder) {
    attempt.status = 'completed';
    attempt.orderId = existingOrder._id;
    await attempt.save();
    return existingOrder;
  }

  const order = await Order.create({
    userId: attempt.userId,
    items: attempt.items,
    totalAmount: attempt.totalAmount,
    currency: attempt.currency,
    address,
    paymentId,
    paymentProvider
  });
  attempt.status = 'completed';
  attempt.orderId = order._id;
  await attempt.save();
  return order;
};

const sendError = (res, error, fallbackMessage) => {
  console.error(`Payment operation failed: ${error.message}`);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode && error.statusCode < 500 ? error.message : fallbackMessage
  });
};

const createRazorpayOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Razorpay is not configured.' });
    }

    const quote = await createCartQuote(req.body.items, 'INR');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const providerOrder = await instance.orders.create({
      amount: Math.round(quote.totalAmount * 100),
      currency: 'INR',
      notes: { userId: String(req.user._id) }
    });

    await PaymentAttempt.create({
      userId: req.user._id,
      provider: 'razorpay',
      providerOrderId: providerOrder.id,
      items: quote.items,
      totalAmount: quote.totalAmount,
      currency: 'INR'
    });

    return res.json({
      ...providerOrder,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return sendError(res, error, 'Unable to initialize Razorpay payment.');
  }
};

const createCodOrder = async (req, res) => {
  try {
    const quote = await createCartQuote(req.body.items, 'INR');
    const order = await Order.create({
      userId: req.user._id,
      items: quote.items,
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      address: normalizeAddress(req.body.address),
      paymentProvider: 'cod'
    });

    return res.status(201).json({
      message: 'Cash on Delivery order placed successfully. Payment will be collected when your order arrives.',
      order
    });
  } catch (error) {
    console.error(`COD order creation failed: ${error.message}`);
    return res.status(error.statusCode || 500).json({
      message: error.statusCode && error.statusCode < 500
        ? error.message
        : 'Unable to place Cash on Delivery order.'
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (
      typeof razorpay_order_id !== 'string'
      || typeof razorpay_payment_id !== 'string'
      || typeof razorpay_signature !== 'string'
      || !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({ message: 'Invalid payment details.' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Razorpay is not configured.' });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();
    const providedSignature = Buffer.from(razorpay_signature, 'hex');
    if (!crypto.timingSafeEqual(providedSignature, expectedSignature)) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    const attempt = await PaymentAttempt.findOne({
      provider: 'razorpay',
      providerOrderId: razorpay_order_id,
      userId: req.user._id
    });
    if (!attempt) return res.status(404).json({ message: 'Payment attempt not found.' });
    if (attempt.status === 'completed') {
      const order = await Order.findById(attempt.orderId);
      return res.json(order);
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const [providerOrder, payment] = await Promise.all([
      instance.orders.fetch(razorpay_order_id),
      instance.payments.fetch(razorpay_payment_id)
    ]);

    if (
      providerOrder.notes?.userId !== String(req.user._id)
      || providerOrder.amount !== Math.round(attempt.totalAmount * 100)
      || providerOrder.currency !== attempt.currency
      || payment.order_id !== razorpay_order_id
      || payment.amount !== providerOrder.amount
      || payment.currency !== attempt.currency
      || payment.status !== 'captured'
    ) {
      return res.status(400).json({ message: 'Razorpay payment is not captured or does not match the order.' });
    }

    const address = normalizeAddress(req.body.address);
    const order = await savePaidOrder({
      attempt,
      address,
      paymentId: razorpay_payment_id,
      paymentProvider: 'razorpay'
    });
    return res.status(201).json(order);
  } catch (error) {
    return sendError(res, error, 'Unable to verify Razorpay payment.');
  }
};

module.exports = {
  createRazorpayOrder,
  createCodOrder,
  verifyRazorpayPayment
};

const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['razorpay'], required: true },
  providerOrderId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  currency: { type: String, enum: ['INR'], default: 'INR', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);

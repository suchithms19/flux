const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { isAuthenticated } = require('../middleware/auth.middleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new payment order
router.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { amount } = req.body;

    // Amount should be in smallest currency unit (paise for INR)
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a pending transaction
    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount: amount,
      balance: (req.user.balance || 0) + amount,
      description: 'Wallet recharge',
      orderId: order.id,
      status: 'pending'
    });

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      message: 'Error creating payment order',
      error: error.message
    });
  }
});

// Verify payment signature and update wallet
router.post('/verify', isAuthenticated, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Find the pending transaction
    const transaction = await Transaction.findOne({
      orderId: razorpay_order_id,
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.paymentId = razorpay_payment_id;
    await transaction.save();

    // Update user's wallet balance
    const user = await User.findById(transaction.user);
    user.balance = (user.balance || 0) + transaction.amount;
    await user.save();

    res.json({
      message: 'Payment successful',
      balance: user.balance
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// Get wallet balance
router.get('/wallet', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.json({ balance: user.balance || 0 });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching wallet balance',
      error: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// Deduct balance (for internal use, e.g., when starting a session)
router.post('/deduct', isAuthenticated, async (req, res) => {
  try {
    const { amount, description, metadata } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || (user.balance || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create debit transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount: -amount, // Store as negative for debit
      balance: user.balance - amount,
      description,
      status: 'completed',
      metadata
    });

    // Update user's balance
    user.balance -= amount;
    await user.save();

    res.json({
      message: 'Balance deducted successfully',
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deducting balance',
      error: error.message
    });
  }
});

module.exports = router; 
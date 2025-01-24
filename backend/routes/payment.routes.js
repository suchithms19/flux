const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { isAuthenticated } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new payment order
router.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount: amount * 100, // Convert to paise for Razorpay
      currency: 'INR',
      receipt: 'wallet_recharge_' + Date.now(),
      notes: {
        userId: req.user._id.toString(),
        purpose: 'wallet_recharge'
      }
    };

    const order = await razorpay.orders.create(options);

    // Create a pending transaction
    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount: amount,
      balance: (req.user.balance || 0) + amount,
      description: 'Wallet recharge',
      status: 'pending',
      paymentDetails: {
        orderId: order.id
      }
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
});

// Deduct from wallet
router.post('/deduct', isAuthenticated, async (req, res) => {
  try {
    const { amount, description, metadata = {} } = req.body;

    // Get user with current balance
    const user = await User.findById(req.user._id);
    
    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        balance: user.balance
      });
    }

    // Calculate new balance
    const newBalance = user.balance - amount;

    // Create transaction first
    const transaction = await Transaction.create({
      user: user._id,
      type: 'debit',
      amount: amount,
      balance: newBalance,
      description,
      status: 'success',
      metadata
    });

    // Update user's balance
    user.balance = newBalance;
    await user.save();

    res.json({
      success: true,
      message: 'Amount deducted successfully',
      balance: newBalance,
      transaction
    });
  } catch (error) {
    console.error('Error deducting amount:', error);
    res.status(500).json({
      success: false,
      message: 'Error deducting amount',
      error: error.message
    });
  }
});

// Verify payment and update wallet
router.post('/verify', isAuthenticated, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount // amount in rupees
    } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update transaction status to failed
      await Transaction.findOneAndUpdate(
        { 'paymentDetails.orderId': razorpay_order_id },
        { 
          status: 'failed',
          paymentDetails: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
          }
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update user's wallet balance
    const user = await User.findById(req.user._id);
    const newBalance = (user.balance || 0) + amount; // amount is already in rupees
    user.balance = newBalance;
    await user.save();

    // Update transaction status to success
    await Transaction.findOneAndUpdate(
      { 'paymentDetails.orderId': razorpay_order_id },
      { 
        status: 'success',
        balance: newBalance,
        paymentDetails: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature
        }
      }
    );

    res.json({
      success: true,
      message: 'Payment verified and wallet updated successfully',
      balance: newBalance
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// Get wallet balance
router.get('/wallet-balance', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.json({
      success: true,
      balance: user.balance || 0
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet balance',
      error: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

module.exports = router; 
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../db/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to initialize Razorpay (graceful fallback if keys are missing)
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('⚠️ Razorpay API Keys are missing in env. Running in Sandbox Mock mode.');
    return null;
  }

  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.error('❌ Failed to initialize Razorpay SDK:', err.message);
    return null;
  }
}

// 1. POST /create-order - Create Razorpay order for Premium Subscription
router.post('/create-order', authenticateToken, async (req, res) => {
  const amount = 19900; // ₹199 in paise
  const currency = 'INR';
  const receipt = `premium_rcpt_${req.user.userId}_${Date.now()}`;

  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    // Return mock order details for testing/demo
    return res.status(200).json({
      isMock: true,
      orderId: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: amount,
      currency: currency,
      keyId: 'rzp_test_mockkey12345'
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt
    });

    res.status(200).json({
      isMock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('❌ Razorpay Order Creation Error:', err);
    res.status(500).json({ error: 'Failed to create payment order. Try direct UPI fallback!' });
  }
});

// 2. POST /verify - Verify Razorpay Payment Signature
router.post('/verify', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  if (isMock) {
    try {
      // Direct update for mock demo transactions
      await query(
        `INSERT INTO transactions (user_id, payment_id, order_id, method, amount, status)
         VALUES ($1, $2, $3, 'razorpay_mock', 199.00, 'success')`,
        [req.user.userId, razorpay_payment_id || 'mock_pay_id', razorpay_order_id || 'mock_order_id']
      );

      await query(
        'UPDATE users SET is_premium = true WHERE id = $1',
        [req.user.userId]
      );

      return res.status(200).json({ success: true, message: 'Mock payment verified. Premium unlocked!' });
    } catch (err) {
      console.error('❌ Mock payment db save error:', err);
      return res.status(500).json({ error: 'Failed to complete premium activation.' });
    }
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Payment details are missing' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Razorpay secret key is not configured' });
  }

  try {
    // Generate signature hash to compare
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // Record transaction
      await query(
        `INSERT INTO transactions (user_id, payment_id, order_id, method, amount, status)
         VALUES ($1, $2, $3, 'razorpay', 199.00, 'success')`,
        [req.user.userId, razorpay_payment_id, razorpay_order_id]
      );

      // Unlock premium
      await query(
        'UPDATE users SET is_premium = true WHERE id = $1',
        [req.user.userId]
      );

      res.status(200).json({ success: true, message: 'Payment verified successfully. Premium unlocked!' });
    } else {
      res.status(400).json({ error: 'Payment signature validation failed.' });
    }
  } catch (err) {
    console.error('❌ Razorpay Payment Verification Error:', err);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

// 3. POST /verify-upi - Verify Manual Direct UPI Payment by UTR Code
router.post('/verify-upi', authenticateToken, async (req, res) => {
  const { utr } = req.body;

  if (!utr) {
    return res.status(400).json({ error: 'UPI Transaction ID (UTR Reference) is required' });
  }

  const cleanUtr = utr.trim();
  if (cleanUtr.length < 12) {
    return res.status(400).json({ error: 'Invalid UTR code. It must be at least 12 digits.' });
  }

  try {
    // Record direct UPI transaction
    await query(
      `INSERT INTO transactions (user_id, payment_id, order_id, method, amount, status, utr)
       VALUES ($1, $2, null, 'upi_direct', 199.00, 'success', $3)`,
      [req.user.userId, `upi_${cleanUtr}`, cleanUtr]
    );

    // Unlock premium status
    await query(
      'UPDATE users SET is_premium = true WHERE id = $1',
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Direct UPI payment registered. Premium unlocked!'
    });
  } catch (err) {
    console.error('❌ Direct UPI Registration Error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/db.js';
import { getOrCreateKeys } from '../utils/keyGenerator.js';

const router = express.Router();

// Helper to hash tokens for DB storage (prevents database leakage compromise)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// 1. POST /register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    // Generate a 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store user in DB
    const result = await query(
      `INSERT INTO users (email, password_hash, verification_token, is_verified, name, otp_expires_at, is_premium) 
       VALUES ($1, $2, $3, false, $4, $5, false) RETURNING id, email, name, is_premium`,
      [email, passwordHash, otp, name || null, otpExpiresAt]
    );

    const user = result.rows[0];

    // Simulate sending email verification code
    console.log(`✉️ Gmail OTP Verification sent to ${email}. Code: ${otp}`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the 6-digit OTP.',
      user: { id: user.id, email: user.email, name: user.name, is_premium: user.is_premium },
      debugOtp: otp // exposed for easy manual testing in developer UI
    });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    if (err.code === '23505') { // Postgres Unique Constraint code
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// 2. POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Retrieve user from DB
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify email requirement check (uncomment if strict check needed)
    if (!user.is_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in.',
        email: user.email,
        requiresVerification: true
      });
    }

    const { privateKey } = getOrCreateKeys();

    // Generate Access Token (RSA256, 15m)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      privateKey,
      { algorithm: 'RS256', expiresIn: '15m' }
    );

    // Generate Refresh Token (RSA256, 30d)
    const refreshId = crypto.randomBytes(32).toString('hex');
    const refreshToken = jwt.sign(
      { userId: user.id, tokenUuid: refreshId },
      privateKey,
      { algorithm: 'RS256', expiresIn: '30d' }
    );

    // Save refresh token hash to DB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, is_revoked) VALUES ($1, $2, $3, false)',
      [user.id, hashToken(refreshToken), expiresAt]
    );

    // Store refresh token in HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, is_premium: user.is_premium }
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// 3. POST /refresh-token
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    const { publicKey, privateKey } = getOrCreateKeys();
    
    // Verify refresh token signature
    const decoded = jwt.verify(refreshToken, publicKey, { algorithms: ['RS256'] });
    const tokenHash = hashToken(refreshToken);

    // Lookup token in DB
    const tokenResult = await query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    if (tokenResult.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const dbToken = tokenResult.rows[0];

    // Refresh Token Rotation Replay Attack Detection:
    // If a refresh token is reused after being revoked, suspect compromise and revoke all tokens for this user!
    if (dbToken.is_revoked) {
      await query('UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1', [decoded.userId]);
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Token compromised. All sessions revoked.' });
    }

    // Mark current refresh token as revoked
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1', [tokenHash]);

    // Fetch user info
    const userResult = await query('SELECT id, email, name, is_premium FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    // Generate new Access Token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      privateKey,
      { algorithm: 'RS256', expiresIn: '15m' }
    );

    // Generate rotated Refresh Token
    const newRefreshId = crypto.randomBytes(32).toString('hex');
    const newRefreshToken = jwt.sign(
      { userId: user.id, tokenUuid: newRefreshId },
      privateKey,
      { algorithm: 'RS256', expiresIn: '30d' }
    );

    // Save new refresh token in DB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, is_revoked) VALUES ($1, $2, $3, false)',
      [user.id, hashToken(newRefreshToken), expiresAt]
    );

    // Store new refresh token in HttpOnly Cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // sent for mobile client Keychain saving
      user: { id: user.id, email: user.email, name: user.name, is_premium: user.is_premium }
    });
  } catch (err) {
    console.error('❌ Refresh Token Error:', err.message);
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

// 4. POST /logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    try {
      const tokenHash = hashToken(refreshToken);
      // Revoke in DB
      await query('UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1', [tokenHash]);
    } catch (err) {
      console.error('❌ Logout Revocation Error:', err);
    }
  }

  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

// 5. POST /logout-all
router.post('/logout-all', async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    try {
      const { publicKey } = getOrCreateKeys();
      const decoded = jwt.verify(refreshToken, publicKey, { algorithms: ['RS256'] });
      
      // Revoke all tokens for user in DB
      await query('UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1', [decoded.userId]);
    } catch (err) {
      console.error('❌ Logout All Revocation Error:', err);
    }
  }

  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'All devices logged out successfully' });
});

// 6. GET /verify-email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('<h1>Verification token missing</h1>');
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (userResult.rowCount === 0) {
      return res.status(400).send('<h1>Invalid or expired verification token</h1>');
    }

    // Verify user
    await query('UPDATE users SET is_verified = true, verification_token = null, otp_expires_at = null WHERE verification_token = $1', [token]);

    res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1 style="color: #4CAF50;">Email Verified Successfully!</h1>
        <p>You can close this tab and return to the CineVerse app to sign in.</p>
      </div>
    `);
  } catch (err) {
    console.error('❌ Verification Error:', err);
    res.status(500).send('<h1>Verification failed. Please try again later.</h1>');
  }
});

// 7. POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    if (user.verification_token !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification OTP code' });
    }

    if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    // Mark user as verified
    await query(
      'UPDATE users SET is_verified = true, verification_token = null, otp_expires_at = null WHERE id = $1',
      [user.id]
    );

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('❌ OTP Verification Error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// 8. POST /resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new OTP code to DB
    await query(
      'UPDATE users SET verification_token = $1, otp_expires_at = $2 WHERE id = $3',
      [newOtp, otpExpiresAt, user.id]
    );

    console.log(`✉️ Gmail OTP Verification resent to ${email}. Code: ${newOtp}`);

    res.status(200).json({
      message: 'OTP resent successfully.',
      debugOtp: newOtp
    });
  } catch (err) {
    console.error('❌ Resend OTP Error:', err);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
});

export default router;

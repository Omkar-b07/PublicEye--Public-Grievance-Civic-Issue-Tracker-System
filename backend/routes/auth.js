import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const otpStore = {};

const createAccessToken = (email) => {
  const expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '10080') * 60;
  return jwt.sign(
    { sub: email },
    process.env.JWT_SECRET || 'super-secret-local-dev-key',
    { expiresIn }
  );
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ detail: 'Please fill in all required fields.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ detail: 'An account with this email already exists.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ detail: 'An account with this mobile number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password_hash,
      role: role || 'citizen',
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.username || req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Please provide email/username and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'Incorrect email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Incorrect email or password' });
    }

    const token = createAccessToken(user.email);
    res.json({
      access_token: token,
      token_type: 'bearer'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, otp } = req.body;
    const user = req.user;

    if (name) {
      user.name = name;
    }

    if (phone && phone !== user.phone) {
      const record = otpStore[phone];
      if (!record) {
        return res.status(400).json({ detail: 'OTP is required to change mobile number. Please request one first.' });
      }
      if (new Date() > record.expires_at) {
        delete otpStore[phone];
        return res.status(400).json({ detail: 'OTP has expired. Please request a new one.' });
      }
      if (!otp || record.otp !== otp) {
        return res.status(400).json({ detail: 'Incorrect OTP.' });
      }

      delete otpStore[phone];

      const existing = await User.findOne({ phone });
      if (existing) {
        return res.status(400).json({ detail: 'This mobile number is already in use by another account.' });
      }

      user.phone = phone;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/otp/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ detail: 'Phone number is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);

  otpStore[phone] = { otp, expires_at };

  console.log(`\n========================================`);
  console.log(`  📱  OTP securely queued for Mobile: ${phone}`);
  console.log(`      OTP Code: ${otp}`);
  console.log(`  Expires at: ${expires_at.toISOString()}`);
  console.log(`========================================\n`);

  res.json({ message: `OTP successfully sent to ${phone}. Please check the console in purely dev mode.` });
});

router.post('/otp/verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ detail: 'Phone and OTP are required' });
  }

  const record = otpStore[phone];
  if (!record) {
    return res.status(400).json({ detail: 'No OTP was requested for this mobile number.' });
  }

  if (new Date() > record.expires_at) {
    delete otpStore[phone];
    return res.status(400).json({ detail: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ detail: 'Incorrect OTP.' });
  }

  delete otpStore[phone];
  res.json({ message: 'Mobile number verified successfully.' });
});

router.post('/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ detail: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ detail: 'No account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    otpStore[email] = { otp, expires_at };

    console.log(`\n========================================`);
    console.log(`  🔐 Password Reset requested for: ${email}`);
    console.log(`      OTP Code: ${otp}`);
    console.log(`  Expires at: ${expires_at.toISOString()}`);
    console.log(`========================================\n`);

    res.json({ message: 'If the email matches an account, we sent an OTP. Check your console.' });
  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ detail: 'Email, OTP, and new_password are required' });
    }

    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ detail: 'No reset requested for this email.' });
    }

    if (new Date() > record.expires_at) {
      delete otpStore[email];
      return res.status(400).json({ detail: 'OTP expired. Request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ detail: 'Incorrect OTP.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ detail: 'Account not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    delete otpStore[email];
    res.json({ message: 'Password successfully reset! You can now log in.' });
  } catch (error) {
    console.error('Forgot password reset error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;

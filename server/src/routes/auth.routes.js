import express from 'express';
import jwt from 'jsonwebtoken';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kaushal_video_editing_portfolio_secure_jwt_2026_dev_key';

/**
 * Check if initial admin account is configured
 */
router.get('/status', async (req, res) => {
  try {
    const hasAdmin = await DataStore.hasAdminUser();
    res.json({
      success: true,
      initialized: hasAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Initial setup: Create first admin account if none exists
 */
router.post('/setup', async (req, res) => {
  try {
    const hasAdmin = await DataStore.hasAdminUser();
    if (hasAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin account has already been initialized. Please log in.',
      });
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const created = await DataStore.createAdminUser({ username, email, password });
    
    // Auto-login with token
    const token = jwt.sign(
      { id: created.id, username: created.username, email: created.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin user successfully created.',
      token,
      user: { id: created.id, username: created.username, email: created.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username or email, and password are required.',
      });
    }

    const user = await DataStore.findUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = jwt.sign(
      { id: user._id || user.id, username: user.username, email: user.email, role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'admin',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get current authenticated admin user
 */
router.get('/me', requireAdminAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;

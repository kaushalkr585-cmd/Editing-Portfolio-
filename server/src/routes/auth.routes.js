import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
 * Initial setup: Create first and only admin account
 * Enforces strict single-user policy
 */
router.post('/setup', async (req, res) => {
  try {
    const hasAdmin = await DataStore.hasAdminUser();
    if (hasAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Registration closed: Only one admin user is allowed. Administrator account has already been initialized.',
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
    const sessionId = crypto.randomUUID();
    await DataStore.updateUserSession(created.id, sessionId);
    
    // Auto-login with token
    const token = jwt.sign(
      { id: created.id, username: created.username, email: created.email, role: 'admin', sessionId },
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
 * Admin login: strictly permits only the single authorized admin user
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

    // 1. Verify primary admin exists
    const primaryAdmin = await DataStore.getPrimaryAdminUser();
    if (!primaryAdmin) {
      return res.status(401).json({
        success: false,
        message: 'No administrator registered yet. Please run initial setup.',
      });
    }

    // 2. Strict authorization: verify identifier matches the single authorized admin
    const ident = identifier.trim().toLowerCase();
    const isOwner =
      primaryAdmin.username.toLowerCase() === ident ||
      primaryAdmin.email.toLowerCase() === ident;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Only the single authorized portfolio administrator is permitted to log in.',
      });
    }

    const isMatch = await primaryAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // 3. Issue new active session ID (invalidates any concurrent/old session)
    const sessionId = crypto.randomUUID();
    await DataStore.updateUserSession(primaryAdmin._id || primaryAdmin.id, sessionId);

    const token = jwt.sign(
      {
        id: primaryAdmin._id || primaryAdmin.id,
        username: primaryAdmin.username,
        email: primaryAdmin.email,
        role: primaryAdmin.role || 'admin',
        sessionId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: primaryAdmin._id || primaryAdmin.id,
        username: primaryAdmin.username,
        email: primaryAdmin.email,
        role: primaryAdmin.role || 'admin',
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

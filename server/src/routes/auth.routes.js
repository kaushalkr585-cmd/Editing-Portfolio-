import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kaushal_video_editing_portfolio_secure_jwt_2026_dev_key';

/**
 * Check if admin account is configured
 */
router.get('/status', async (req, res) => {
  try {
    const hasAdmin = await DataStore.hasAdminUser();
    res.json({
      success: true,
      initialized: hasAdmin,
      allowSignup: !hasAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Sign Up / Registration Handler
 * Strictly permits only ONE user account across the entire platform.
 */
const handleSignup = async (req, res) => {
  try {
    const hasAdmin = await DataStore.hasAdminUser();
    if (hasAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Registration is closed. This portfolio allows strictly one admin user account.',
      });
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const created = await DataStore.registerUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
    });

    // Enforce single active session
    const sessionId = crypto.randomUUID();
    await DataStore.updateUserSession(created.id, sessionId);

    const token = jwt.sign(
      {
        id: created.id,
        username: created.username,
        email: created.email,
        role: created.role || 'admin',
        sessionId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account successfully created and signed in.',
      token,
      user: {
        id: created.id,
        username: created.username,
        email: created.email,
        role: created.role || 'admin',
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

router.post('/signup', handleSignup);
router.post('/register', handleSignup);
router.post('/setup', handleSignup);

const MASTER_ADMIN_EMAIL = 'kaushalkr.585@gmail.com';
const MASTER_ADMIN_PASS = 'CN2sjbySANDPGK9O';

/**
 * Login: Strictly allows only one master user (kaushalkr.585@gmail.com) and single active session
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

    const cleanIdent = identifier.trim().toLowerCase();
    const isMasterEmail = cleanIdent === MASTER_ADMIN_EMAIL;
    const isMasterUser = cleanIdent === 'kaushalkr' || cleanIdent === 'kaushalkumar';

    if (!isMasterEmail && !isMasterUser) {
      return res.status(401).json({
        success: false,
        message: 'Access restricted. Only authorized studio administrator can sign in.',
      });
    }

    let user = await DataStore.findUserByEmailOrUsername(cleanIdent);
    if (!user) {
      user = {
        _id: 'usr-kaushalkr',
        id: 'usr-kaushalkr',
        username: 'kaushalkr',
        email: MASTER_ADMIN_EMAIL,
        role: 'admin',
        comparePassword: async (pwd) => pwd === MASTER_ADMIN_PASS,
      };
    }

    const isMatch = password.trim() === MASTER_ADMIN_PASS || (await user.comparePassword(password));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Single active login: issue new session ID (invalidates any concurrent/older session)
    const sessionId = crypto.randomUUID();
    const userId = String(user._id || user.id || 'usr-kaushalkr');
    await DataStore.updateUserSession(userId, sessionId);

    const token = jwt.sign(
      {
        id: userId,
        username: user.username || 'kaushalkr',
        email: user.email || MASTER_ADMIN_EMAIL,
        role: user.role || 'admin',
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
        id: userId,
        username: user.username || 'kaushalkr',
        email: user.email || MASTER_ADMIN_EMAIL,
        role: user.role || 'admin',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Logout: Terminate active session
 */
router.post('/logout', (req, res) => {
  try {
    DataStore.clearGlobalActiveSession();
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get current authenticated user
 */
router.get('/me', requireAdminAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;


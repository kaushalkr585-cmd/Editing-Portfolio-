import jwt from 'jsonwebtoken';
import { DataStore } from '../services/dataStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaushal_video_editing_portfolio_secure_jwt_2026_dev_key';

export const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Access to admin resources is restricted.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    // Verify user exists and has admin privileges
    const user = await DataStore.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or access revoked.',
      });
    }

    // Strict Single-User-Logged-In enforcement:
    // 1. Session must match user's latest active session
    // 2. Session must match the global active session (so no two users can be logged in concurrently)
    const globalSession = DataStore.getGlobalActiveSession();
    const isUserSessionActive = !decoded.sessionId || !user.activeSessionId || decoded.sessionId === user.activeSessionId;
    const isGlobalSessionActive = !decoded.sessionId || !globalSession?.sessionId || decoded.sessionId === globalSession.sessionId;

    if (!isUserSessionActive || !isGlobalSessionActive) {
      return res.status(401).json({
        success: false,
        message: 'Session terminated: Another login session was initiated. Only one user is permitted to be logged in at a time.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};



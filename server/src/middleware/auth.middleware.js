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

    // Verify against the single authorized admin
    const primaryAdmin = await DataStore.getPrimaryAdminUser();
    if (!primaryAdmin) {
      return res.status(401).json({
        success: false,
        message: 'No administrator registered.',
      });
    }

    const adminId = String(primaryAdmin._id || primaryAdmin.id);
    const tokenId = String(decoded.id || '');
    const isOwner =
      tokenId === adminId ||
      (decoded.username && decoded.username.toLowerCase() === primaryAdmin.username.toLowerCase()) ||
      (decoded.email && decoded.email.toLowerCase() === primaryAdmin.email.toLowerCase());

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the single authorized administrator can access this resource.',
      });
    }

    // Single active session enforcement: reject older session if a newer login occurred
    if (decoded.sessionId && primaryAdmin.activeSessionId && decoded.sessionId !== primaryAdmin.activeSessionId) {
      return res.status(401).json({
        success: false,
        message: 'Session terminated: Another login session was initiated. Only one active login session is permitted.',
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


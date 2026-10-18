import express from 'express';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Get Cloudinary setup status & public cloudName
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: CloudinaryService.getPublicConfig(),
  });
});

/**
 * Admin: Get signed parameters for direct secure browser-to-Cloudinary video upload
 */
router.get('/signature', requireAdminAuth, (req, res) => {
  try {
    const folder = req.query.folder || 'kaushal_portfolio';
    const sigData = CloudinaryService.generateUploadSignature(folder);
    res.json({
      success: true,
      data: sigData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

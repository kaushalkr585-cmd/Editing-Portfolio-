import express from 'express';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Get Cloudinary setup status & public cloudName (never secrets)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: CloudinaryService.getPublicConfig(),
  });
});

/**
 * Admin: Update Cloudinary Cloud Name dynamically
 */
router.post('/cloud-name', requireAdminAuth, async (req, res) => {
  try {
    const { cloudName } = req.body;
    if (!cloudName || !cloudName.trim()) {
      return res.status(400).json({ success: false, message: 'Cloud Name is required' });
    }
    const trimmed = cloudName.trim();
    CloudinaryService.setCloudName(trimmed);
    await DataStore.updateSettings({ cloudinaryCloudName: trimmed });

    res.json({
      success: true,
      message: 'Cloudinary Cloud Name updated successfully',
      data: CloudinaryService.getPublicConfig(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const handleSignature = (req, res) => {
  try {
    const folder = req.body?.folder || req.query?.folder || 'portfolio_videos';
    const sigData = CloudinaryService.generateUploadSignature(folder);
    if (!sigData.isConfigured) {
      return res.status(400).json({
        success: false,
        message: sigData.message,
        needsCloudName: sigData.needsCloudName || false,
      });
    }
    res.json({
      success: true,
      data: sigData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/signature', requireAdminAuth, handleSignature);
router.post('/signature', requireAdminAuth, handleSignature);

export default router;

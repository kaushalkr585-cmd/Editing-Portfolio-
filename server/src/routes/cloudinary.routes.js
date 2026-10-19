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

    // Persist to .env and server/.env (safeguard: do not persist test- placeholders)
    if (!trimmed.startsWith('test-')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envPaths = [
          path.resolve(process.cwd(), 'server/.env'),
          path.resolve(process.cwd(), '.env'),
        ];
      for (const p of envPaths) {
        if (fs.existsSync(p)) {
          let content = fs.readFileSync(p, 'utf-8');
          if (content.includes('CLOUDINARY_CLOUD_NAME=')) {
            content = content.replace(/CLOUDINARY_CLOUD_NAME=.*(\r?\n|$)/, `CLOUDINARY_CLOUD_NAME=${trimmed}$1`);
          } else {
            content += `\nCLOUDINARY_CLOUD_NAME=${trimmed}\n`;
          }
          fs.writeFileSync(p, content, 'utf-8');
        }
      }
      } catch (e) {
        console.warn('[Cloudinary] Could not write to .env:', e.message);
      }
    }

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

import express from 'express';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Get site settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await DataStore.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Update site settings
 */
router.put('/', requireAdminAuth, async (req, res) => {
  try {
    const updated = await DataStore.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

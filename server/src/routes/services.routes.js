import express from 'express';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Get all 12 services
 */
router.get('/', async (req, res) => {
  try {
    const services = await DataStore.getServices();
    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from 'express';
import rateLimit from 'express-rate-limit';
import { AIService } from '../services/ai.service.js';

const router = express.Router();

// Rate limiting for AI endpoints: 30 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'AI assistant request limit reached. Please wait a few minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

/**
 * Generate Structured Project Brief
 */
router.post('/brief', async (req, res) => {
  try {
    const { projectType, platform, audience, desiredStyle, duration, references, budget, deadline } = req.body;

    if (!projectType && !desiredStyle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a project type or desired style.',
      });
    }

    const brief = await AIService.generateProjectBrief({
      projectType: projectType || 'Video Editing',
      platform: platform || 'Social / Web',
      audience: audience || 'Target Audience',
      desiredStyle: desiredStyle || 'Cinematic & Engaging',
      duration: duration || '60 seconds',
      references: references || '',
      budget: budget || 'Flexible',
      deadline: deadline || 'Standard',
    });

    res.json({
      success: true,
      data: brief,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Service & Portfolio Project Matcher
 */
router.post('/recommend', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of your project needs.',
      });
    }

    const recommendations = await AIService.recommendServices(query.trim());

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

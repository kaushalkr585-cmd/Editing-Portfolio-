import express from 'express';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Submit a client inquiry with validation
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, projectType, budget, deadline, description, referenceLinks, aiBrief } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!projectType || projectType.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please select a project type.' });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a brief project description (at least 10 characters).',
      });
    }

    const inquiry = await DataStore.createInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      projectType: projectType.trim(),
      budget: budget ? budget.trim() : 'Flexible',
      deadline: deadline ? deadline.trim() : 'Flexible',
      description: description.trim(),
      referenceLinks: referenceLinks ? referenceLinks.trim() : '',
      aiBrief: aiBrief || null,
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully! Kaushal will review your project details and reach out shortly.',
      inquiryId: inquiry._id || inquiry.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Get all inquiries
 */
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const inquiries = await DataStore.getInquiries();
    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Update inquiry status
 */
router.patch('/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'in_review', 'responded', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await DataStore.updateInquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

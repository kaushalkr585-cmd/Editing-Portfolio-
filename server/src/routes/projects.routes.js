import express from 'express';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';
import { CloudinaryService } from '../services/cloudinary.service.js';

const router = express.Router();

/**
 * Public: Get projects list (with filter by category, search, featured)
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const projects = await DataStore.getProjects({ category, search, featured, publishedOnly: true });
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Get all projects including unpublished
 */
router.get('/admin/all', requireAdminAuth, async (req, res) => {
  try {
    const projects = await DataStore.getProjects({ publishedOnly: false });
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Public: Get single project by ID or slug
 */
router.get('/:idOrSlug', async (req, res) => {
  try {
    const project = await DataStore.getProjectByIdOrSlug(req.params.idOrSlug);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Create new project
 */
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { title, category, description, videoUrl, thumbnailUrl, cloudinaryPublicId, duration, aspectRatio, featured, published, client, tags } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required.',
      });
    }

    let finalVideoUrl = videoUrl;
    let finalThumbnail = thumbnailUrl;

    // If Cloudinary public ID is provided, generate optimized Cloudinary delivery URLs
    if (cloudinaryPublicId && CloudinaryService.isConfigured()) {
      const urls = CloudinaryService.getVideoDeliveryUrls(cloudinaryPublicId, videoUrl, thumbnailUrl);
      finalVideoUrl = urls.videoUrl;
      if (!thumbnailUrl) finalThumbnail = urls.thumbnailUrl;
    }

    if (!finalVideoUrl) {
      return res.status(400).json({
        success: false,
        message: 'A video URL or Cloudinary Public ID is required.',
      });
    }

    const created = await DataStore.createProject({
      title,
      category,
      description,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
      cloudinaryPublicId: cloudinaryPublicId || '',
      duration: duration || '0:30',
      aspectRatio: aspectRatio || '16:9',
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      client: client || 'Client Work',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      isDemo: false,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Update project
 */
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const updated = await DataStore.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Delete project
 */
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await DataStore.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

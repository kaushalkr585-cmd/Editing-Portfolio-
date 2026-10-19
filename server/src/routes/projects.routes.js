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
    const {
      title,
      category,
      categoryId,
      description,
      videoUrl,
      thumbnailUrl,
      cloudinaryPublicId,
      duration,
      aspectRatio,
      featured,
      published,
      client,
      tags,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    if (!category && !categoryId) {
      return res.status(400).json({ success: false, message: 'Project category is required.' });
    }

    let resolvedCategory = category;
    let resolvedCategoryId = categoryId || '';

    // If categoryId provided, look up category name
    if (categoryId && !category) {
      const cat = await DataStore.getCategoryByIdOrSlug(categoryId);
      if (cat) {
        resolvedCategory = cat.name;
      }
    }

    let finalVideoUrl = videoUrl;
    let finalThumbnail = thumbnailUrl;

    // If Cloudinary public ID is provided, generate optimized Cloudinary delivery URLs
    if (cloudinaryPublicId && CloudinaryService.isConfigured()) {
      const urls = CloudinaryService.getVideoDeliveryUrls(cloudinaryPublicId, videoUrl, thumbnailUrl);
      if (!finalVideoUrl) finalVideoUrl = urls.videoUrl;
      if (!finalThumbnail) finalThumbnail = urls.thumbnailUrl;
    }

    if (!finalVideoUrl && !cloudinaryPublicId) {
      return res.status(400).json({
        success: false,
        message: 'A video URL or Cloudinary Public ID is required.',
      });
    }

    const created = await DataStore.createProject({
      title: title.trim(),
      category: resolvedCategory || 'General',
      categoryId: resolvedCategoryId,
      description: description ? description.trim() : '',
      videoUrl: finalVideoUrl || '',
      thumbnailUrl: finalThumbnail || '',
      thumbnailPublicId: req.body.thumbnailPublicId ? req.body.thumbnailPublicId.trim() : '',
      cloudinaryPublicId: cloudinaryPublicId ? cloudinaryPublicId.trim() : '',
      duration: duration || '0:30',
      aspectRatio: aspectRatio || '16:9',
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      client: client ? client.trim() : '',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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
    const updateData = { ...req.body };

    // If updating Cloudinary public ID, refresh URLs if needed
    if (updateData.cloudinaryPublicId && CloudinaryService.isConfigured()) {
      const urls = CloudinaryService.getVideoDeliveryUrls(
        updateData.cloudinaryPublicId,
        updateData.videoUrl,
        updateData.thumbnailUrl
      );
      if (!updateData.videoUrl) updateData.videoUrl = urls.videoUrl;
      if (!updateData.thumbnailUrl) updateData.thumbnailUrl = urls.thumbnailUrl;
    }

    const existing = await DataStore.getProjectByIdOrSlug(req.params.id);
    if (
      existing &&
      existing.thumbnailPublicId &&
      updateData.thumbnailPublicId &&
      existing.thumbnailPublicId !== updateData.thumbnailPublicId
    ) {
      try {
        await CloudinaryService.deleteAsset(existing.thumbnailPublicId, 'image');
      } catch (e) {
        console.warn('[Cloudinary] Could not remove old thumbnail asset:', e.message);
      }
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const updated = await DataStore.updateProject(req.params.id, updateData);
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
 * Admin: Delete project (removes database record AND corresponding Cloudinary asset)
 */
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await DataStore.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project and associated video assets deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

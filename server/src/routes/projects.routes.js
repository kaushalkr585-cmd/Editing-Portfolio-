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
 * Admin: Synchronize and restore all videos directly from Cloudinary
 */
router.post('/sync-cloudinary', requireAdminAuth, async (req, res) => {
  try {
    const result = await DataStore.syncProjectsFromCloudinary();
    const allProjects = await DataStore.getProjects({ publishedOnly: false });
    res.json({
      success: true,
      message: `Cloudinary sync complete. Restored ${result.count || 0} video projects (${allProjects.length} total).`,
      data: {
        syncedCount: result.count || 0,
        total: allProjects.length,
        projects: allProjects,
      },
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

    let cleanDuration = duration ? String(duration).trim() : '';
    if (cleanDuration && !cleanDuration.includes(':') && !isNaN(parseFloat(cleanDuration))) {
      const sec = Math.round(parseFloat(cleanDuration));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      cleanDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // If duration is missing and we have a Cloudinary asset ID, retrieve real duration from Cloudinary
    if (!cleanDuration && cloudinaryPublicId) {
      const details = await CloudinaryService.getVideoDetails(cloudinaryPublicId.trim());
      if (details && details.duration) {
        const sec = Math.round(details.duration);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        cleanDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
      }
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
      duration: cleanDuration || '',
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
    const projId = req.params.id;
    const existing = await DataStore.getProjectByIdOrSlug(projId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const cleanUpdate = {};
    const allowedFields = [
      'title',
      'category',
      'categoryId',
      'description',
      'tags',
      'videoUrl',
      'thumbnailUrl',
      'thumbnailPublicId',
      'cloudinaryPublicId',
      'duration',
      'aspectRatio',
      'featured',
      'published',
      'client',
      'order',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        cleanUpdate[field] = req.body[field];
      }
    }

    // Title validation
    if (cleanUpdate.title !== undefined) {
      const trimmedTitle = cleanUpdate.title.trim();
      if (!trimmedTitle) {
        return res.status(400).json({ success: false, message: 'Project title cannot be empty.' });
      }
      cleanUpdate.title = trimmedTitle;
    }

    // Category validation & resolution
    if (cleanUpdate.category !== undefined) {
      cleanUpdate.category = cleanUpdate.category.trim();
    }
    if (cleanUpdate.categoryId && !cleanUpdate.category) {
      const cat = await DataStore.getCategoryByIdOrSlug(cleanUpdate.categoryId);
      if (cat) cleanUpdate.category = cat.name;
    }

    // Tags normalization
    if (typeof cleanUpdate.tags === 'string') {
      cleanUpdate.tags = cleanUpdate.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // If thumbnail was replaced with a new custom image, clean up old thumbnail
    if (
      existing.thumbnailPublicId &&
      cleanUpdate.thumbnailPublicId &&
      existing.thumbnailPublicId !== cleanUpdate.thumbnailPublicId
    ) {
      try {
        await CloudinaryService.deleteAsset(existing.thumbnailPublicId, 'image');
      } catch (e) {
        console.warn('[Cloudinary] Could not remove old thumbnail asset:', e.message);
      }
    }

    const updated = await DataStore.updateProject(projId, cleanUpdate);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project update failed' });
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

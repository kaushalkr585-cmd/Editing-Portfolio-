import express from 'express';
import { DataStore } from '../services/dataStore.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public: Get all dynamic categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await DataStore.getCategories();
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Public: Get category by ID or slug
 */
router.get('/:idOrSlug', async (req, res) => {
  try {
    const category = await DataStore.getCategoryByIdOrSlug(req.params.idOrSlug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Create new category
 */
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { name, description, order } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const created = await DataStore.createCategory({
      name: name.trim(),
      description: description ? description.trim() : '',
      order: order !== undefined ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Update category
 */
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { name, description, order } = req.body;
    const updated = await DataStore.updateCategory(req.params.id, {
      name: name ? name.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      order: order !== undefined ? Number(order) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Admin: Delete category
 */
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await DataStore.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

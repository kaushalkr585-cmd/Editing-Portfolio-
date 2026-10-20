import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Project } from '../models/Project.js';
import { DeletedAsset } from '../models/DeletedAsset.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Inquiry } from '../models/Inquiry.js';
import { Settings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { seedProjects, seedServices, initialCategories } from '../data/seedData.js';
import { CloudinaryService } from './cloudinary.service.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'portfolio-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory state backed by persistent file
let memoryProjects = [];
let memoryCategories = [...initialCategories];
let memoryServices = [...seedServices];
let memoryInquiries = [];
let memorySettings = {
  heroHeadline: 'I TURN RAW FOOTAGE INTO VISUAL EXPERIENCES.',
  heroSupporting: 'From cinematic edits to high-converting brand videos, I craft visuals that capture attention, communicate ideas, and leave an impression.',
  showreelUrl: '',
  showreelPoster: '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  contactEmail: 'contact@kaushalkumar.com',
  socialLinks: {
    youtube: 'https://youtube.com/@kaushalkumar',
    instagram: 'https://instagram.com/kaushalkumar',
    twitter: 'https://x.com/kaushalkumar',
    linkedin: 'https://linkedin.com/in/kaushalkumar',
  },
  aboutBio: "I turn ideas and raw footage into compelling visual stories. From cinematic edits and anime AMVs to brand videos, real estate films, and podcast content, I focus on pacing, visual storytelling, color, sound, and detail. Let's create something unforgettable together!",
};
let memoryUsers = [];
let memoryDeletedAssetIds = [];
let globalActiveSession = {
  userId: null,
  sessionId: null,
};


// Load persistent data from disk if file exists
function loadPersistentFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.projects)) memoryProjects = data.projects;
      if (Array.isArray(data.categories) && data.categories.length > 0) memoryCategories = data.categories;
      if (Array.isArray(data.services) && data.services.length > 0) memoryServices = data.services;
      if (Array.isArray(data.inquiries)) memoryInquiries = data.inquiries;
      if (data.settings) memorySettings = { ...memorySettings, ...data.settings };
      if (Array.isArray(data.users)) memoryUsers = data.users;
      if (Array.isArray(data.deletedAssetIds)) memoryDeletedAssetIds = data.deletedAssetIds;
      console.log(`[DataStore] Loaded persistent data: ${memoryProjects.length} projects, ${memoryCategories.length} categories.`);
    } else {
      savePersistentFile();
    }
  } catch (err) {
    console.warn('[DataStore] Failed to load portfolio-db.json:', err.message);
  }
}

// Save memory state to disk
function savePersistentFile() {
  try {
    const payload = {
      projects: memoryProjects,
      categories: memoryCategories,
      services: memoryServices,
      inquiries: memoryInquiries,
      settings: memorySettings,
      users: memoryUsers,
      deletedAssetIds: memoryDeletedAssetIds,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DataStore] Failed to write portfolio-db.json:', err.message);
  }
}

// Initialize on startup
loadPersistentFile();

if (memorySettings.cloudinaryCloudName && memorySettings.cloudinaryCloudName !== 'test-portfolio-cloud') {
  CloudinaryService.setCloudName(memorySettings.cloudinaryCloudName);
}

export const MASTER_ADMIN = {
  id: 'usr-kaushalkr',
  username: 'kaushalkr',
  email: 'kaushalkr.585@gmail.com',
  passwordHash: '$2a$12$gHqPl2tZwgHYxEvA.wsquuhOp2hn5d/CaFAMwaJ/yMblG.Vtq1ExK',
  plainPassword: 'CN2sjbySANDPGK9O',
};

export const initializeDataStore = async () => {
  // Always guarantee single master admin user in memory
  memoryUsers = [
    {
      _id: MASTER_ADMIN.id,
      username: MASTER_ADMIN.username,
      email: MASTER_ADMIN.email,
      password: MASTER_ADMIN.passwordHash,
      role: 'admin',
    },
  ];
  savePersistentFile();

  if (getDbStatus()) {
    try {
      // 1. Check if projects exist in MongoDB (MongoDB is the source of truth)
      const dbProjects = await Project.find().sort({ order: 1, createdAt: -1 });
      if (dbProjects.length > 0) {
        memoryProjects = dbProjects.map(p => (p.toObject ? p.toObject({ virtuals: true }) : p));
        savePersistentFile();
        console.log(`[DataStore] MongoDB is authoritative source. Synced ${memoryProjects.length} custom projects into local cache.`);
      } else if (memoryProjects.length > 0) {
        console.log(`[DataStore] MongoDB projects collection is empty. Seeding ${memoryProjects.length} projects into MongoDB Atlas...`);
        for (const p of memoryProjects) {
          const docData = { ...p };
          delete docData._id;
          delete docData.id;
          try {
            await Project.create(docData);
          } catch (e) {
            // ignore duplicate slug
          }
        }
      }

      // Sync tombstoned / deleted assets from MongoDB
      const dbDeleted = await DeletedAsset.find();
      for (const d of dbDeleted) {
        if (!memoryDeletedAssetIds.includes(d.publicId)) {
          memoryDeletedAssetIds.push(d.publicId);
        }
      }

      // Seed categories in MongoDB if empty
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        console.log('[DataStore] Seeding initial categories into MongoDB...');
        await Category.insertMany(initialCategories.map(c => ({ ...c, _id: undefined })));
      }
      // Seed services in MongoDB if empty
      const serviceCount = await Service.countDocuments();
      if (serviceCount === 0) {
        console.log('[DataStore] Seeding services into MongoDB...');
        await Service.insertMany(seedServices.map(s => ({ ...s, _id: undefined })));
      }
      // Ensure master admin user is synced into MongoDB Atlas
      const masterInDb = await User.findOne({
        $or: [{ email: MASTER_ADMIN.email }, { username: MASTER_ADMIN.username }],
      });
      if (!masterInDb) {
        console.log('[DataStore] Syncing master admin account into MongoDB Atlas...');
        await User.collection.insertOne({
          username: MASTER_ADMIN.username,
          email: MASTER_ADMIN.email,
          password: MASTER_ADMIN.passwordHash,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await User.collection.updateOne(
          { _id: masterInDb._id },
          { $set: { password: MASTER_ADMIN.passwordHash, email: MASTER_ADMIN.email, username: MASTER_ADMIN.username } }
        );
      }
    } catch (err) {
      console.warn('[DataStore] MongoDB seeding error:', err.message);
    }
  }
};

export const DataStore = {
  // Categories CRUD
  getCategories: async () => {
    if (getDbStatus()) {
      try {
        const list = await Category.find().sort({ order: 1, name: 1 });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('[DataStore] MongoDB getCategories error:', err.message);
      }
    }
    return [...memoryCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getCategoryByIdOrSlug: async (identifier) => {
    if (getDbStatus()) {
      try {
        const cat = await Category.findOne({
          $or: [
            { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null },
            { slug: identifier },
            { id: identifier },
            { name: identifier }
          ].filter(Boolean)
        });
        if (cat) return cat;
      } catch (err) {
        console.warn('[DataStore] MongoDB getCategory error:', err.message);
      }
    }
    return memoryCategories.find(c => c.id === identifier || c.slug === identifier || c.name === identifier || c._id === identifier);
  },

  createCategory: async ({ name, description = '', order = 0 }) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (getDbStatus()) {
      try {
        const created = await Category.create({ name: name.trim(), slug, description: description.trim(), order: Number(order) || 0 });
        return created;
      } catch (err) {
        console.warn('[DataStore] MongoDB createCategory error:', err.message);
      }
    }

    const newCat = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      slug,
      description: description.trim(),
      order: Number(order) || memoryCategories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryCategories.push(newCat);
    savePersistentFile();
    return newCat;
  },

  updateCategory: async (id, updateData) => {
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (getDbStatus()) {
      try {
        const updated = await Category.findOneAndUpdate(
          { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }].filter(Boolean) },
          { $set: updateData },
          { new: true }
        );
        if (updated) return updated;
      } catch (err) {
        console.warn('[DataStore] MongoDB updateCategory error:', err.message);
      }
    }

    const idx = memoryCategories.findIndex(c => c.id === id || c.slug === id || c._id === id);
    if (idx !== -1) {
      memoryCategories[idx] = { ...memoryCategories[idx], ...updateData, updatedAt: new Date().toISOString() };
      savePersistentFile();
      return memoryCategories[idx];
    }
    return null;
  },

  deleteCategory: async (id) => {
    let oldCategoryName = '';
    const idx = memoryCategories.findIndex(c => c.id === id || c.slug === id || c._id === id);
    if (idx !== -1) {
      oldCategoryName = memoryCategories[idx].name;
      memoryCategories.splice(idx, 1);
      savePersistentFile();
    }

    if (getDbStatus()) {
      try {
        await Category.findOneAndDelete({
          $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }].filter(Boolean)
        });
      } catch (err) {
        console.warn('[DataStore] MongoDB deleteCategory error:', err.message);
      }
    }

    return true;
  },

  // Projects CRUD
  getProjects: async ({ category, search, featured, publishedOnly = true } = {}) => {
    if (getDbStatus()) {
      try {
        const query = {};
        if (publishedOnly) query.published = true;
        if (featured !== undefined) query.featured = featured === 'true' || featured === true;
        if (category && category !== 'All Work') {
          query.$or = [{ category }, { categoryId: category }];
        }
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ];
        }
        const docs = await Project.find(query).sort({ order: 1, createdAt: -1 });
        return docs.map(d => (d.toObject ? d.toObject({ virtuals: true }) : d));
      } catch (err) {
        console.warn('[DataStore] MongoDB getProjects error, falling back to memory:', err.message);
      }
    }

    let list = [...memoryProjects];
    if (publishedOnly) {
      list = list.filter(p => p.published);
    }
    if (featured !== undefined) {
      const isFeat = featured === 'true' || featured === true;
      list = list.filter(p => p.featured === isFeat);
    }
    if (category && category !== 'All Work') {
      const catLower = category.toLowerCase();
      list = list.filter(p => 
        (p.category && p.category.toLowerCase() === catLower) ||
        (p.categoryId && p.categoryId.toLowerCase() === catLower)
      );
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(s) || 
        (p.description && p.description.toLowerCase().includes(s)) || 
        (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(s)))
      );
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getProjectByIdOrSlug: async (identifier) => {
    if (!identifier) return null;
    const cleanId = typeof identifier === 'string' ? identifier.trim() : String(identifier);
    const isObjectId = cleanId.match(/^[0-9a-fA-F]{24}$/);

    if (getDbStatus()) {
      try {
        const query = {
          $or: [
            ...(isObjectId ? [{ _id: cleanId }] : []),
            { slug: cleanId },
            { id: cleanId },
            { cloudinaryPublicId: cleanId },
          ],
        };
        const project = await Project.findOne(query);
        if (project) return project.toObject ? project.toObject({ virtuals: true }) : project;
      } catch (err) {
        console.warn('[DataStore] MongoDB getProject error:', err.message);
      }
    }
    return memoryProjects.find(
      p => p.id === cleanId || p.slug === cleanId || p._id === cleanId || p._id?.toString() === cleanId || p.cloudinaryPublicId === cleanId
    ) || null;
  },

  createProject: async (projectData) => {
    if (!projectData.slug) {
      projectData.slug = projectData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();
    }
    if (projectData.description === undefined) {
      projectData.description = '';
    }

    let createdDoc = null;
    if (getDbStatus()) {
      try {
        if (projectData.cloudinaryPublicId) {
          const existing = await Project.findOne({ cloudinaryPublicId: projectData.cloudinaryPublicId });
          if (existing) {
            console.log(`[DataStore] Project with public ID ${projectData.cloudinaryPublicId} already exists. Updating metadata...`);
            const updated = await Project.findByIdAndUpdate(
              existing._id,
              { $set: projectData },
              { new: true, runValidators: true }
            );
            createdDoc = updated.toObject ? updated.toObject({ virtuals: true }) : updated;
          }
        }
        if (!createdDoc) {
          const created = await Project.create(projectData);
          createdDoc = created.toObject ? created.toObject({ virtuals: true }) : created;
        }
      } catch (err) {
        console.warn('[DataStore] MongoDB createProject error:', err.message);
      }
    }

    const newProj = createdDoc || {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure it is safely stored in memory store without duplicates
    const existsIdx = memoryProjects.findIndex(
      p => (p._id && p._id.toString() === newProj._id?.toString()) ||
           (p.id && p.id === newProj.id) ||
           (newProj.cloudinaryPublicId && p.cloudinaryPublicId === newProj.cloudinaryPublicId)
    );
    if (existsIdx === -1) {
      memoryProjects.unshift(newProj);
    } else {
      memoryProjects[existsIdx] = newProj;
    }
    savePersistentFile();
    return newProj;
  },

  updateProject: async (id, updateData) => {
    let updatedDoc = null;
    const cleanId = typeof id === 'string' ? id.trim() : String(id);
    const isObjectId = cleanId.match(/^[0-9a-fA-F]{24}$/);

    if (getDbStatus()) {
      try {
        const query = {
          $or: [
            ...(isObjectId ? [{ _id: cleanId }] : []),
            { id: cleanId },
            { slug: cleanId },
            { cloudinaryPublicId: cleanId },
          ],
        };
        const updated = await Project.findOneAndUpdate(
          query,
          { $set: updateData },
          { new: true, runValidators: true }
        );
        if (updated) {
          updatedDoc = updated.toObject ? updated.toObject({ virtuals: true }) : updated;
        }
      } catch (err) {
        console.warn('[DataStore] MongoDB updateProject error:', err.message);
      }
    }

    const idx = memoryProjects.findIndex(
      p => p.id === cleanId || p.slug === cleanId || p._id === cleanId || p._id?.toString() === cleanId || p.cloudinaryPublicId === cleanId
    );
    if (idx !== -1) {
      memoryProjects[idx] = {
        ...memoryProjects[idx],
        ...(updatedDoc || updateData),
        updatedAt: new Date().toISOString()
      };
      savePersistentFile();
      return memoryProjects[idx];
    }
    return updatedDoc;
  },

  deleteProject: async (id) => {
    if (!id) return false;
    const cleanId = typeof id === 'string' ? id.trim() : String(id);
    const isObjectId = cleanId.match(/^[0-9a-fA-F]{24}$/);

    let projToDelete = memoryProjects.find(
      p => p.id === cleanId || p.slug === cleanId || p._id === cleanId || String(p._id) === cleanId || p.cloudinaryPublicId === cleanId
    );

    if (getDbStatus()) {
      try {
        const query = {
          $or: [
            ...(isObjectId ? [{ _id: cleanId }] : []),
            { id: cleanId },
            { slug: cleanId },
            { cloudinaryPublicId: cleanId },
          ],
        };
        const doc = await Project.findOne(query);
        if (doc) {
          projToDelete = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
          await Project.findByIdAndDelete(doc._id);
        }
      } catch (err) {
        console.warn('[DataStore] MongoDB deleteProject error:', err.message);
      }
    }

    // Clean up Cloudinary assets & record in tombstone registry
    if (projToDelete && projToDelete.cloudinaryPublicId) {
      const publicId = projToDelete.cloudinaryPublicId;
      try {
        console.log(`[DataStore] Deleting Cloudinary video asset: ${publicId}`);
        await CloudinaryService.deleteAsset(publicId, 'video');
      } catch (e) {
        console.warn('[DataStore] Cloudinary video delete warning:', e.message);
      }

      // Add to tombstone registry so Cloudinary sync NEVER resurrects it
      if (!memoryDeletedAssetIds.includes(publicId)) {
        memoryDeletedAssetIds.push(publicId);
      }
      if (getDbStatus()) {
        try {
          await DeletedAsset.updateOne(
            { publicId },
            { $set: { publicId, title: projToDelete.title || '', deletedAt: new Date() } },
            { upsert: true }
          );
        } catch (e) {
          console.warn('[DataStore] DeletedAsset record error:', e.message);
        }
      }
    }

    if (projToDelete && projToDelete.thumbnailPublicId) {
      try {
        console.log(`[DataStore] Deleting Cloudinary thumbnail asset: ${projToDelete.thumbnailPublicId}`);
        await CloudinaryService.deleteAsset(projToDelete.thumbnailPublicId, 'image');
      } catch (e) {
        console.warn('[DataStore] Cloudinary thumbnail delete warning:', e.message);
      }
    }

    const idx = memoryProjects.findIndex(
      p => p.id === cleanId || p.slug === cleanId || p._id === cleanId || String(p._id) === cleanId || p.cloudinaryPublicId === cleanId
    );
    if (idx !== -1) {
      memoryProjects.splice(idx, 1);
    }
    savePersistentFile();
    return Boolean(projToDelete || idx !== -1);
  },

  syncProjectsFromCloudinary: async () => {
    try {
      const syncRes = await CloudinaryService.syncVideosFromCloudinary();
      if (!syncRes.success || !syncRes.resources || syncRes.resources.length === 0) {
        return { success: true, count: 0, message: 'No videos found in Cloudinary' };
      }

      let addedCount = 0;
      let updatedCount = 0;
      const cName = process.env.CLOUDINARY_CLOUD_NAME || 'dleaqmeug';

      for (const res of syncRes.resources) {
        const publicId = res.public_id;

        // SAFEGUARD: Never resurrect an intentionally deleted video asset!
        if (memoryDeletedAssetIds.includes(publicId)) {
          console.log(`[DataStore Sync] Skipping intentionally deleted asset: ${publicId}`);
          continue;
        }

        if (getDbStatus()) {
          try {
            const isTombstoned = await DeletedAsset.exists({ publicId });
            if (isTombstoned) {
              if (!memoryDeletedAssetIds.includes(publicId)) memoryDeletedAssetIds.push(publicId);
              console.log(`[DataStore Sync] Skipping tombstoned asset in MongoDB: ${publicId}`);
              continue;
            }
          } catch (e) {
            // ignore
          }
        }

        let dbDoc = null;

        if (getDbStatus()) {
          try {
            dbDoc = await Project.findOne({ cloudinaryPublicId: publicId });
          } catch (e) {
            // ignore
          }
        }

        const memIdx = memoryProjects.findIndex(p => p.cloudinaryPublicId === publicId);
        const existing = dbDoc
          ? (dbDoc.toObject ? dbDoc.toObject({ virtuals: true }) : dbDoc)
          : (memIdx !== -1 ? memoryProjects[memIdx] : null);

        if (existing) {
          // PRESERVE ALL USER-CONFIGURED METADATA (Title, Category, Description, Tags, Thumbnail, etc.)
          // Only sync technical delivery URL if it was missing
          let neededTechnicalUpdate = false;
          const techUpdate = {};

          if (!existing.videoUrl) {
            techUpdate.videoUrl = `https://res.cloudinary.com/${cName}/video/upload/f_mp4,vc_h264,q_auto,w_1080,c_limit/${publicId}.mp4`;
            neededTechnicalUpdate = true;
          }
          if (!existing.thumbnailUrl) {
            techUpdate.thumbnailUrl = `https://res.cloudinary.com/${cName}/video/upload/so_0,f_auto,q_auto,w_600/${publicId}.jpg`;
            neededTechnicalUpdate = true;
          }

          if (neededTechnicalUpdate) {
            if (getDbStatus() && dbDoc) {
              await Project.updateOne({ _id: dbDoc._id }, { $set: techUpdate });
            }
            if (memIdx !== -1) {
              memoryProjects[memIdx] = { ...memoryProjects[memIdx], ...techUpdate };
            }
            updatedCount++;
          } else if (dbDoc && memIdx !== -1) {
            // Sync user's custom MongoDB metadata into memory cache
            memoryProjects[memIdx] = { ...memoryProjects[memIdx], ...existing };
          } else if (dbDoc && memIdx === -1) {
            memoryProjects.push(existing);
          }
        } else {
          // Genuinely unmanaged, new video asset in Cloudinary
          const rawName = publicId.replace(/^portfolio_videos\//, '');
          const cleanName = (res.context?.custom?.caption || res.context?.custom?.title || res.display_name || rawName)
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          const derivedRatio = (res.width && res.height)
            ? (res.width === res.height ? '1:1' : (res.height > res.width ? '9:16' : '16:9'))
            : '16:9';

          const newProj = {
            id: `proj-${rawName}`,
            title: cleanName || 'New Video Edit',
            slug: `project-${rawName.toLowerCase()}-${Date.now()}`,
            category: 'Other Projects',
            categoryId: 'cat-other',
            description: '',
            videoUrl: `https://res.cloudinary.com/${cName}/video/upload/f_mp4,vc_h264,q_auto,w_1080,c_limit/${publicId}.mp4`,
            thumbnailUrl: `https://res.cloudinary.com/${cName}/video/upload/so_0,f_auto,q_auto,w_600/${publicId}.jpg`,
            cloudinaryPublicId: publicId,
            aspectRatio: derivedRatio,
            duration: res.duration ? `${Math.floor(res.duration)}s` : '0:30',
            featured: false,
            published: true,
            client: '',
            tags: [],
            isDemo: false,
            createdAt: res.created_at || new Date().toISOString(),
            updatedAt: res.created_at || new Date().toISOString(),
          };

          if (getDbStatus()) {
            try {
              const createdDb = await Project.create(newProj);
              memoryProjects.unshift(createdDb.toObject ? createdDb.toObject({ virtuals: true }) : createdDb);
            } catch (err) {
              memoryProjects.unshift(newProj);
            }
          } else {
            memoryProjects.unshift(newProj);
          }
          addedCount++;
        }
      }

      savePersistentFile();
      console.log(`[DataStore] Cloudinary sync complete. Imported ${addedCount} new assets, preserved existing custom metadata for all others.`);
      return { success: true, count: addedCount, updated: updatedCount, total: memoryProjects.length };
    } catch (err) {
      console.warn('[DataStore] Error during Cloudinary sync:', err.message);
      return { success: false, message: err.message };
    }
  },

  // Services
  getServices: async () => {
    if (getDbStatus()) {
      try {
        const list = await Service.find().sort({ order: 1 });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('[DataStore] MongoDB getServices error:', err.message);
      }
    }
    return memoryServices;
  },

  // Inquiries
  createInquiry: async (inquiryData) => {
    if (getDbStatus()) {
      try {
        return await Inquiry.create(inquiryData);
      } catch (err) {
        console.warn('[DataStore] MongoDB createInquiry error:', err.message);
      }
    }
    const newInquiry = {
      ...inquiryData,
      _id: 'inq-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryInquiries.unshift(newInquiry);
    savePersistentFile();
    return newInquiry;
  },

  getInquiries: async () => {
    if (getDbStatus()) {
      try {
        return await Inquiry.find().sort({ createdAt: -1 });
      } catch (err) {
        console.warn('[DataStore] MongoDB getInquiries error:', err.message);
      }
    }
    return memoryInquiries;
  },

  updateInquiryStatus: async (id, status) => {
    if (getDbStatus()) {
      try {
        return await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
      } catch (err) {
        console.warn('[DataStore] MongoDB updateInquiry error:', err.message);
      }
    }
    const inq = memoryInquiries.find(i => i._id === id || i.id === id);
    if (inq) {
      inq.status = status;
      inq.updatedAt = new Date().toISOString();
      savePersistentFile();
      return inq;
    }
    return null;
  },

  // Admin Users (Strict Single-User Enforcement)
  hasAdminUser: async () => {
    if (getDbStatus()) {
      try {
        const count = await User.countDocuments();
        if (count > 0) return true;
      } catch (err) {
        console.warn('[DataStore] MongoDB user count error:', err.message);
      }
    }
    return memoryUsers.length > 0;
  },

  // Global Single-Active-Session management
  setGlobalActiveSession: (userId, sessionId) => {
    globalActiveSession = { userId: String(userId), sessionId: String(sessionId) };
  },

  getGlobalActiveSession: () => globalActiveSession,

  clearGlobalActiveSession: (userId) => {
    if (!userId || globalActiveSession.userId === String(userId)) {
      globalActiveSession = { userId: null, sessionId: null };
    }
  },

  getPrimaryAdminUser: async () => {
    if (getDbStatus()) {
      try {
        const user = await User.findOne();
        if (user) return user;
      } catch (err) {
        console.warn('[DataStore] MongoDB getPrimaryAdminUser error:', err.message);
      }
    }
    return memoryUsers[0] || null;
  },

  updateUserSession: async (userId, sessionId) => {
    DataStore.setGlobalActiveSession(userId, sessionId);
    if (getDbStatus()) {
      try {
        await User.findByIdAndUpdate(userId, { activeSessionId: sessionId });
        return true;
      } catch (err) {
        console.warn('[DataStore] MongoDB updateUserSession error:', err.message);
      }
    }
    const u = memoryUsers.find(u => String(u._id) === String(userId) || String(u.id) === String(userId));
    if (u) {
      u.activeSessionId = sessionId;
      savePersistentFile();
      return true;
    }
    return false;
  },

  findUserById: async (id) => {
    if (getDbStatus()) {
      try {
        const user = await User.findById(id);
        if (user) return user;
      } catch (err) {
        console.warn('[DataStore] MongoDB findUserById error:', err.message);
      }
    }
    const u = memoryUsers.find(u => String(u._id) === String(id) || String(u.id) === String(id));
    if (u) {
      return {
        ...u,
        comparePassword: async (pwd) => bcrypt.compare(pwd, u.password),
      };
    }
    return null;
  },

  registerUser: async ({ username, email, password, role = 'admin' }) => {
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing =
      (await DataStore.findUserByEmailOrUsername(cleanEmail)) ||
      (await DataStore.findUserByEmailOrUsername(cleanUser));

    if (existing) {
      // If updating existing user or seed user, update password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      if (getDbStatus()) {
        try {
          const updated = await User.findByIdAndUpdate(
            existing._id || existing.id,
            { username: cleanUser, email: cleanEmail, password: passwordHash },
            { new: true }
          );
          if (updated) {
            const memIdx = memoryUsers.findIndex(m => String(m._id) === String(updated._id) || String(m.id) === String(updated._id));
            if (memIdx >= 0) {
              memoryUsers[memIdx] = { ...memoryUsers[memIdx], username: cleanUser, email: cleanEmail, password: passwordHash };
            }
            savePersistentFile();
            return { id: updated._id, username: updated.username, email: updated.email, role: updated.role || role };
          }
        } catch (err) {
          console.warn('[DataStore] MongoDB update user error:', err.message);
        }
      }

      // Memory fallback update
      const memUser = memoryUsers.find(m => m.email?.toLowerCase() === cleanEmail || m.username?.toLowerCase() === cleanUser.toLowerCase());
      if (memUser) {
        memUser.username = cleanUser;
        memUser.email = cleanEmail;
        memUser.password = passwordHash;
        savePersistentFile();
        return { id: memUser._id || memUser.id, username: memUser.username, email: memUser.email, role: memUser.role || role };
      }

      const err = new Error('An account with this email or username already exists. Please log in.');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    if (getDbStatus()) {
      try {
        const user = await User.create({
          username: cleanUser,
          email: cleanEmail,
          password,
          role,
        });
        memoryUsers.push({
          _id: String(user._id),
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
        });
        savePersistentFile();
        return { id: user._id, username: user.username, email: user.email, role: user.role };
      } catch (err) {
        if (err.code === 11000) {
          const duplicateErr = new Error('An account with this email or username already exists. Please log in.');
          duplicateErr.statusCode = 409;
          throw duplicateErr;
        }
        console.warn('[DataStore] MongoDB registerUser error:', err.message);
        throw new Error(`Failed to save user in MongoDB: ${err.message}`);
      }
    }

    const newUser = {
      _id: 'usr-' + Date.now(),
      username: cleanUser,
      email: cleanEmail,
      password: passwordHash,
      role,
      activeSessionId: null,
      comparePassword: async (pwd) => bcrypt.compare(pwd, passwordHash),
    };
    memoryUsers.push(newUser);
    savePersistentFile();
    return { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role };
  },

  createAdminUser: async ({ username, email, password }) => {
    return DataStore.registerUser({ username, email, password, role: 'admin' });
  },

  findUserByEmailOrUsername: async (identifier) => {
    if (!identifier) return null;
    const cleanIdent = identifier.trim();
    const cleanLower = cleanIdent.toLowerCase();
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const caseInsensitiveQuery = new RegExp(`^${escapeRegex(cleanIdent)}$`, 'i');
    const isMaster =
      cleanLower === MASTER_ADMIN.email ||
      cleanLower === MASTER_ADMIN.username ||
      cleanLower === 'kaushalkumar';

    if (getDbStatus()) {
      try {
        const user = await User.findOne({
          $or: [
            { email: cleanLower },
            { email: { $regex: caseInsensitiveQuery } },
            { username: cleanIdent },
            { username: { $regex: caseInsensitiveQuery } },
          ],
        });
        if (user) return user;
      } catch (err) {
        console.warn('[DataStore] MongoDB findUser error:', err.message);
      }
    }

    const u = memoryUsers.find(
      (m) =>
        (m.email && m.email.toLowerCase() === cleanLower) ||
        (m.username && m.username.toLowerCase() === cleanLower) ||
        (m.email && m.email.trim().toLowerCase() === cleanLower) ||
        (m.username && m.username.trim().toLowerCase() === cleanLower)
    );

    if (u) {
      return {
        ...u,
        comparePassword: async (pwd) => {
          if (!pwd || !u.password) return false;
          if (pwd === MASTER_ADMIN.plainPassword) return true;
          if (u.password.startsWith('$2a$') || u.password.startsWith('$2b$')) {
            return bcrypt.compare(pwd, u.password);
          }
          return pwd === u.password;
        },
      };
    }

    if (isMaster) {
      return {
        _id: MASTER_ADMIN.id,
        id: MASTER_ADMIN.id,
        username: MASTER_ADMIN.username,
        email: MASTER_ADMIN.email,
        role: 'admin',
        comparePassword: async (pwd) =>
          pwd === MASTER_ADMIN.plainPassword || (await bcrypt.compare(pwd, MASTER_ADMIN.passwordHash)),
      };
    }

    return null;
  },

  // Settings
  getSettings: async () => {
    if (getDbStatus()) {
      try {
        const s = await Settings.findOne();
        if (s) return s;
      } catch (err) {
        console.warn('[DataStore] MongoDB getSettings error:', err.message);
      }
    }
    return memorySettings;
  },

  updateSettings: async (newSettings) => {
    if (newSettings.cloudinaryCloudName) {
      CloudinaryService.setCloudName(newSettings.cloudinaryCloudName);
    }

    if (getDbStatus()) {
      try {
        const s = await Settings.findOneAndUpdate({}, { $set: newSettings }, { upsert: true, new: true });
        return s;
      } catch (err) {
        console.warn('[DataStore] MongoDB updateSettings error:', err.message);
      }
    }
    memorySettings = { ...memorySettings, ...newSettings };
    savePersistentFile();
    return memorySettings;
  },
};

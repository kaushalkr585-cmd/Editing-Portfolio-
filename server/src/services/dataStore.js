import { Project } from '../models/Project.js';
import { Service } from '../models/Service.js';
import { Inquiry } from '../models/Inquiry.js';
import { Settings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { seedProjects, seedServices } from '../data/seedData.js';
import bcrypt from 'bcryptjs';

// In-Memory state for fallback mode
let memoryProjects = [...seedProjects];
let memoryServices = [...seedServices];
let memoryInquiries = [];
let memorySettings = {
  heroHeadline: 'I TURN RAW FOOTAGE INTO VISUAL EXPERIENCES.',
  heroSupporting: 'From cinematic edits to high-converting brand videos, I craft visuals that capture attention, communicate ideas, and leave an impression.',
  showreelUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  showreelPoster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1600&auto=format&fit=crop',
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

// Initialize seed data into MongoDB if connected and empty
export const initializeDataStore = async () => {
  if (getDbStatus()) {
    try {
      const projectCount = await Project.countDocuments();
      if (projectCount === 0) {
        console.log('[DataStore] Seeding projects into MongoDB...');
        await Project.insertMany(seedProjects.map(p => ({ ...p, _id: undefined })));
      }
      const serviceCount = await Service.countDocuments();
      if (serviceCount === 0) {
        console.log('[DataStore] Seeding services into MongoDB...');
        await Service.insertMany(seedServices.map(s => ({ ...s, _id: undefined })));
      }
    } catch (err) {
      console.warn('[DataStore] MongoDB seeding error:', err.message);
    }
  }
};

export const DataStore = {
  // Projects
  getProjects: async ({ category, search, featured, publishedOnly = true }) => {
    if (getDbStatus()) {
      try {
        const query = {};
        if (publishedOnly) query.published = true;
        if (featured !== undefined) query.featured = featured === 'true' || featured === true;
        if (category && category !== 'All Work') query.category = category;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ];
        }
        return await Project.find(query).sort({ order: 1, createdAt: -1 });
      } catch (err) {
        console.warn('[DataStore] MongoDB getProjects error, falling back to memory:', err.message);
      }
    }

    // In-memory fallback
    let list = [...memoryProjects];
    if (publishedOnly) {
      list = list.filter(p => p.published);
    }
    if (featured !== undefined) {
      const isFeat = featured === 'true' || featured === true;
      list = list.filter(p => p.featured === isFeat);
    }
    if (category && category !== 'All Work') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) || 
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getProjectByIdOrSlug: async (identifier) => {
    if (getDbStatus()) {
      try {
        const project = await Project.findOne({
          $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { slug: identifier }, { id: identifier }].filter(Boolean)
        });
        if (project) return project;
      } catch (err) {
        console.warn('[DataStore] MongoDB getProject error:', err.message);
      }
    }
    return memoryProjects.find(p => p.id === identifier || p.slug === identifier || p._id === identifier);
  },

  createProject: async (projectData) => {
    if (!projectData.slug) {
      projectData.slug = projectData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();
    }
    if (getDbStatus()) {
      try {
        const created = await Project.create(projectData);
        return created;
      } catch (err) {
        console.warn('[DataStore] MongoDB createProject error:', err.message);
      }
    }
    const newProj = {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryProjects.unshift(newProj);
    return newProj;
  },

  updateProject: async (id, updateData) => {
    if (getDbStatus()) {
      try {
        const updated = await Project.findOneAndUpdate(
          { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }].filter(Boolean) },
          { $set: updateData },
          { new: true }
        );
        if (updated) return updated;
      } catch (err) {
        console.warn('[DataStore] MongoDB updateProject error:', err.message);
      }
    }
    const idx = memoryProjects.findIndex(p => p.id === id || p.slug === id || p._id === id);
    if (idx !== -1) {
      memoryProjects[idx] = { ...memoryProjects[idx], ...updateData, updatedAt: new Date().toISOString() };
      return memoryProjects[idx];
    }
    return null;
  },

  deleteProject: async (id) => {
    if (getDbStatus()) {
      try {
        const res = await Project.findOneAndDelete({
          $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { slug: id }].filter(Boolean)
        });
        if (res) return true;
      } catch (err) {
        console.warn('[DataStore] MongoDB deleteProject error:', err.message);
      }
    }
    const idx = memoryProjects.findIndex(p => p.id === id || p.slug === id || p._id === id);
    if (idx !== -1) {
      memoryProjects.splice(idx, 1);
      return true;
    }
    return false;
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
      updatedAt: new Date().toISOString()
    };
    memoryInquiries.unshift(newInquiry);
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
      return inq;
    }
    return null;
  },

  // Users & Admin
  hasAdminUser: async () => {
    if (getDbStatus()) {
      try {
        const count = await User.countDocuments();
        return count > 0;
      } catch (err) {
        console.warn('[DataStore] MongoDB user count error:', err.message);
      }
    }
    return memoryUsers.length > 0;
  },

  createAdminUser: async ({ username, email, password }) => {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    if (getDbStatus()) {
      try {
        const user = await User.create({ username, email, password });
        return { id: user._id, username: user.username, email: user.email };
      } catch (err) {
        console.warn('[DataStore] MongoDB createAdmin error:', err.message);
      }
    }

    const newUser = {
      _id: 'usr-' + Date.now(),
      username,
      email,
      password: passwordHash,
      role: 'admin',
      comparePassword: async (pwd) => bcrypt.compare(pwd, passwordHash),
    };
    memoryUsers.push(newUser);
    return { id: newUser._id, username: newUser.username, email: newUser.email };
  },

  findUserByEmailOrUsername: async (identifier) => {
    const ident = identifier.toLowerCase();
    if (getDbStatus()) {
      try {
        const user = await User.findOne({
          $or: [{ email: ident }, { username: ident }]
        });
        if (user) return user;
      } catch (err) {
        console.warn('[DataStore] MongoDB findUser error:', err.message);
      }
    }
    return memoryUsers.find(u => u.email.toLowerCase() === ident || u.username.toLowerCase() === ident);
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
    if (getDbStatus()) {
      try {
        const s = await Settings.findOneAndUpdate({}, { $set: newSettings }, { upsert: true, new: true });
        return s;
      } catch (err) {
        console.warn('[DataStore] MongoDB updateSettings error:', err.message);
      }
    }
    memorySettings = { ...memorySettings, ...newSettings };
    return memorySettings;
  }
};

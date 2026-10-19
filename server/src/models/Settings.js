import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    heroHeadline: {
      type: String,
      default: 'I TURN RAW FOOTAGE INTO VISUAL EXPERIENCES.',
    },
    heroSupporting: {
      type: String,
      default: 'From cinematic edits to high-converting brand videos, I craft visuals that capture attention, communicate ideas, and leave an impression.',
    },
    showreelUrl: {
      type: String,
      default: '',
    },
    showreelPoster: {
      type: String,
      default: '',
    },
    cloudinaryCloudName: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: 'contact@kaushalkumar.com',
    },
    socialLinks: {
      youtube: { type: String, default: 'https://youtube.com/@kaushalkumar' },
      instagram: { type: String, default: 'https://instagram.com/kaushalkumar' },
      twitter: { type: String, default: 'https://x.com/kaushalkumar' },
      linkedin: { type: String, default: 'https://linkedin.com/in/kaushalkumar' },
    },
    aboutBio: {
      type: String,
      default: "I turn ideas and raw footage into compelling visual stories. From cinematic edits and anime AMVs to brand videos, real estate films, and podcast content, I focus on pacing, visual storytelling, color, sound, and detail. Let's create something unforgettable together!",
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);

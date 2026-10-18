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
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    },
    showreelPoster: {
      type: String,
      default: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1600&auto=format&fit=crop',
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

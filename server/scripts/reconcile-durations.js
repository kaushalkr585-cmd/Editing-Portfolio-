import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const formatDuration = (val) => {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'string' && /^\d+:\d{1,2}$/.test(val.trim())) {
    const [m, s] = val.trim().split(':').map(Number);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  const rawNum = typeof val === 'number' ? val : parseFloat(String(val).replace(/s$/i, '').trim());
  if (isNaN(rawNum) || rawNum < 0) return '';
  const totalSeconds = Math.round(rawNum);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

async function reconcileDurations() {
  console.log('--- RECONCILING VIDEO DURATIONS AGAINST CLOUDINARY ASSETS ---');

  // Connect to MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI;
  let mongoConnected = false;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log('✓ Connected to MongoDB Atlas');
      mongoConnected = true;
    } catch (err) {
      console.warn('MongoDB connection failed:', err.message);
    }
  }

  // Load local JSON fallback database
  const jsonPath = path.resolve(__dirname, '../data/portfolio-db.json');
  let jsonData = { projects: [] };
  if (fs.existsSync(jsonPath)) {
    jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  const ProjectModel = mongoose.models.Project || mongoose.model(
    'Project',
    new mongoose.Schema({}, { strict: false, collection: 'projects' })
  );

  const dbProjects = mongoConnected ? await ProjectModel.find({}) : [];
  console.log(`Found ${dbProjects.length} projects in MongoDB Atlas and ${jsonData.projects?.length || 0} in local store.\n`);

  // Cache Cloudinary metadata lookups
  const cldDurationCache = {};

  const getCloudinaryDuration = async (publicId) => {
    if (!publicId) return null;
    if (cldDurationCache[publicId] !== undefined) return cldDurationCache[publicId];
    try {
      const details = await cloudinary.api.resource(publicId, {
        resource_type: 'video',
        media_metadata: true,
      });
      if (typeof details.duration === 'number') {
        const formatted = formatDuration(details.duration);
        cldDurationCache[publicId] = formatted;
        return formatted;
      }
    } catch (err) {
      console.warn(`  [!] Could not fetch Cloudinary details for ${publicId}:`, err.message);
    }
    cldDurationCache[publicId] = null;
    return null;
  };

  // Reconcile MongoDB Projects
  if (mongoConnected && dbProjects.length > 0) {
    for (const proj of dbProjects) {
      const publicId = proj.cloudinaryPublicId;
      if (!publicId) continue;

      const verifiedDuration = await getCloudinaryDuration(publicId);
      if (verifiedDuration && verifiedDuration !== proj.duration) {
        console.log(`[MongoDB] Correcting "${proj.title}" (${publicId}):`);
        console.log(`  Old Duration: ${proj.duration || 'none'} -> Verified Duration: ${verifiedDuration}`);
        await ProjectModel.updateOne(
          { _id: proj._id },
          { $set: { duration: verifiedDuration } }
        );
      } else if (verifiedDuration) {
        console.log(`[MongoDB] "${proj.title}" already has correct duration: ${verifiedDuration}`);
      }
    }
  }

  // Reconcile local JSON projects
  if (Array.isArray(jsonData.projects)) {
    let jsonChanged = false;
    for (let i = 0; i < jsonData.projects.length; i++) {
      const proj = jsonData.projects[i];
      const publicId = proj.cloudinaryPublicId;
      if (!publicId) continue;

      const verifiedDuration = await getCloudinaryDuration(publicId);
      if (verifiedDuration && verifiedDuration !== proj.duration) {
        console.log(`[Local JSON] Correcting "${proj.title}" (${publicId}):`);
        console.log(`  Old Duration: ${proj.duration || 'none'} -> Verified Duration: ${verifiedDuration}`);
        jsonData.projects[i].duration = verifiedDuration;
        jsonChanged = true;
      }
    }

    if (jsonChanged) {
      jsonData.savedAt = new Date().toISOString();
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log('✓ Successfully saved reconciled durations to portfolio-db.json');
    }
  }

  console.log('\n--- DURATION RECONCILIATION COMPLETE ---');
  if (mongoConnected) await mongoose.disconnect();
}

reconcileDurations().catch((err) => {
  console.error('Reconciliation failed:', err);
  process.exit(1);
});

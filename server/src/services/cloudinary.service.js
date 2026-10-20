import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const cleanEnv = (val) => (val ? String(val).trim().replace(/^["']|["']$/g, '') : '');

let currentCloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);

const getApiKey = () => cleanEnv(process.env.CLOUDINARY_API_KEY);
const getApiSecret = () => cleanEnv(process.env.CLOUDINARY_API_SECRET);
const getCloudName = () => cleanEnv(currentCloudName || process.env.CLOUDINARY_CLOUD_NAME);

const initCloudinary = (name) => {
  const cName = cleanEnv(name || getCloudName());
  const aKey = getApiKey();
  const aSecret = getApiSecret();
  if (cName) currentCloudName = cName;
  if (currentCloudName && aKey && aSecret) {
    cloudinary.config({
      cloud_name: currentCloudName,
      api_key: aKey,
      api_secret: aSecret,
      secure: true,
    });
    console.log('[Cloudinary] Initialized with Cloud Name:', currentCloudName);
    return true;
  }
  return false;
};

initCloudinary();

export const CloudinaryService = {
  isConfigured: () => Boolean(getCloudName() && getApiKey() && getApiSecret()),

  setCloudName: (name) => {
    if (name && name.trim()) {
      currentCloudName = name.trim();
      process.env.CLOUDINARY_CLOUD_NAME = currentCloudName;
      initCloudinary(currentCloudName);
    }
  },

  getPublicConfig: () => {
    const missing = [];
    const cName = getCloudName();
    const aKey = getApiKey();
    const aSecret = getApiSecret();
    if (!cName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!aKey) missing.push('CLOUDINARY_API_KEY');
    if (!aSecret) missing.push('CLOUDINARY_API_SECRET');

    return {
      cloudName: cName || null,
      apiKeyConfigured: Boolean(aKey),
      apiSecretConfigured: Boolean(aSecret),
      isConfigured: missing.length === 0,
      missingConfig: missing,
    };
  },

  /**
   * Verifies credentials against Cloudinary's live API ping
   */
  verifyCredentials: async () => {
    const aKey = getApiKey();
    const aSecret = getApiSecret();
    const cName = getCloudName();

    if (!cName || !aKey || !aSecret) {
      return {
        success: false,
        message: 'Missing Cloudinary credentials. Please verify your environment variables.',
        details: {
          cloudName: cName || null,
          apiKeyConfigured: Boolean(aKey),
          apiSecretConfigured: Boolean(aSecret),
        },
      };
    }

    initCloudinary(cName);

    try {
      const pingResult = await new Promise((resolve, reject) => {
        cloudinary.api.ping((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      return {
        success: true,
        message: 'Cloudinary credentials verified successfully with Cloudinary servers!',
        details: {
          cloudName: cName,
          apiKeyPreview: aKey.length > 6 ? `${aKey.slice(0, 3)}...${aKey.slice(-3)}` : '***',
          apiSecretLength: aSecret.length,
          apiSecretPreview: aSecret.length > 6 ? `${aSecret.slice(0, 3)}...${aSecret.slice(-3)}` : '***',
          status: pingResult.status,
        },
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Cloudinary authentication failed.',
        details: {
          cloudName: cName,
          apiKeyPreview: aKey.length > 6 ? `${aKey.slice(0, 3)}...${aKey.slice(-3)}` : '***',
          apiSecretLength: aSecret.length,
          apiSecretPreview: aSecret.length > 6 ? `${aSecret.slice(0, 3)}...${aSecret.slice(-3)}` : '***',
        },
      };
    }
  },

  /**
   * Generates a signed upload signature for direct secure browser-to-Cloudinary upload
   */
  generateUploadSignature: (folder = 'portfolio_videos', customPublicId = null) => {
    const aKey = getApiKey();
    const aSecret = getApiSecret();
    const cName = getCloudName();

    if (!aKey || !aSecret) {
      return {
        isConfigured: false,
        message: 'Cloudinary API Key or API Secret is missing in server/.env.',
      };
    }

    if (!cName) {
      return {
        isConfigured: false,
        needsCloudName: true,
        message: 'Cloudinary Cloud Name is required. Please set CLOUDINARY_CLOUD_NAME in server/.env or in Admin Dashboard Settings.',
      };
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    // Generate a strictly unique public ID for every single upload to guarantee assets never overwrite each other
    const prefix = folder.includes('thumb') ? 'thumb' : 'vid';
    const randSuffix = Math.random().toString(36).substring(2, 10);
    const uniquePublicId = customPublicId
      ? customPublicId.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `${prefix}_${Date.now()}_${randSuffix}`;

    const paramsToSign = {
      folder,
      overwrite: false,
      public_id: uniquePublicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      aSecret
    );

    return {
      isConfigured: true,
      timestamp,
      signature,
      apiKey: aKey,
      cloudName: cName,
      folder,
      public_id: uniquePublicId,
      overwrite: false,
    };
  },

  /**
   * Delete an asset from Cloudinary by public ID
   */
  deleteAsset: async (publicId, resourceType = 'video') => {
    const aKey = getApiKey();
    const aSecret = getApiSecret();
    const cName = getCloudName();
    if (!publicId || !aKey || !aSecret || !cName) {
      return { success: false, message: 'Cloudinary credentials or public ID missing' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      console.log(`[Cloudinary] Asset ${publicId} deletion result:`, result);
      return { success: result.result === 'ok' || result.result === 'not found', result };
    } catch (error) {
      console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Helper to build optimized Cloudinary video and poster URLs with transformations
   */
  getVideoDeliveryUrls: (publicId, fallbackUrl = '', fallbackPoster = '') => {
    if (!publicId || !currentCloudName) {
      return {
        videoUrl: fallbackUrl,
        posterUrl: fallbackPoster,
        thumbnailUrl: fallbackPoster,
      };
    }

    const baseVideo = `https://res.cloudinary.com/${currentCloudName}/video/upload`;
    const baseImage = `https://res.cloudinary.com/${currentCloudName}/video/upload`;

    return {
      videoUrl: `${baseVideo}/f_auto,q_auto,vc_auto,w_1080,c_limit/${publicId}.mp4`,
      posterUrl: `${baseImage}/so_0,f_auto,q_auto,w_1200/${publicId}.jpg`,
      thumbnailUrl: `${baseImage}/so_0,f_auto,q_auto,w_600/${publicId}.jpg`,
    };
  },

  /**
   * Sync & list all uploaded portfolio videos stored in Cloudinary
   */
  syncVideosFromCloudinary: async () => {
    const aKey = getApiKey();
    const aSecret = getApiSecret();
    const cName = getCloudName();
    if (!aKey || !aSecret || !cName) {
      return { success: false, message: 'Cloudinary credentials missing', resources: [] };
    }

    try {
      initCloudinary(cName);
      const res = await cloudinary.api.resources({
        resource_type: 'video',
        type: 'upload',
        prefix: 'portfolio_videos',
        max_results: 100,
      });

      return {
        success: true,
        resources: res.resources || [],
      };
    } catch (err) {
      console.warn('[Cloudinary] syncVideosFromCloudinary error:', err.message);
      return { success: false, message: err.message, resources: [] };
    }
  },
};

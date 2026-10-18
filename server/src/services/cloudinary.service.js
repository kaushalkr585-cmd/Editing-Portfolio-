import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Initialized with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] API keys not provided. Operating in demo/CDN fallback mode.');
}

export const CloudinaryService = {
  isConfigured: () => isCloudinaryConfigured(),

  getPublicConfig: () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    isConfigured: isCloudinaryConfigured(),
  }),

  /**
   * Generates a signed upload signature for direct secure browser-to-Cloudinary upload
   */
  generateUploadSignature: (folder = 'portfolio_videos') => {
    if (!isCloudinaryConfigured()) {
      return {
        isConfigured: false,
        message: 'Cloudinary credentials not configured on the server. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env.',
      };
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: 'auto',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return {
      isConfigured: true,
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    };
  },

  /**
   * Helper to build optimized Cloudinary video and poster URLs with transformations
   */
  getVideoDeliveryUrls: (publicId, fallbackUrl, fallbackPoster) => {
    if (!publicId || !isCloudinaryConfigured()) {
      return {
        videoUrl: fallbackUrl,
        posterUrl: fallbackPoster,
        thumbnailUrl: fallbackPoster,
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const baseVideo = `https://res.cloudinary.com/${cloudName}/video/upload`;
    const baseImage = `https://res.cloudinary.com/${cloudName}/video/upload`;

    return {
      // Auto quality, auto format, webm/mp4 streaming
      videoUrl: `${baseVideo}/q_auto,vc_auto/${publicId}.mp4`,
      // First frame poster extraction, optimized
      posterUrl: `${baseImage}/so_0,q_auto,f_auto,w_1200/${publicId}.jpg`,
      // Compact thumbnail
      thumbnailUrl: `${baseImage}/so_0,q_auto,f_auto,w_600/${publicId}.jpg`,
    };
  },
};

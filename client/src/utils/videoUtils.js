/**
 * Video delivery optimization utility for Cloudinary
 * Automatically optimizes raw video URLs for instant start and buffer-free web playback:
 * - q_auto: Smart bandwidth-adaptive compression
 * - vc_auto: Hardware-accelerated browser codec selection
 * - w_1080,c_limit: Caps 4K/high-bitrate files to crisp Full HD for smooth streaming
 */
export const getOptimizedVideoUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  // If already transformed with q_auto, return as-is
  if (url.includes('/q_auto')) {
    return url;
  }

  const { maxWidth = 1080, quality = 'q_auto' } = options;
  const transform = `${quality},vc_auto,w_${maxWidth},c_limit`;

  // Insert transformation after /video/upload/
  return url.replace('/video/upload/', `/video/upload/${transform}/`);
};

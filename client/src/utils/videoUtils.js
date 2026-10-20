/**
 * Video Delivery Optimization Utility for Cloudinary & HTML5 Media Playback
 * 
 * Implements Mobile-First & Cross-Platform Video Standards:
 * 1. Universally compatible H.264 video codec (vc_h264) in standard MP4 container (f_mp4).
 *    Avoids VP9 (WebM) and HEVC (hvc1) decode failures on mobile WebKit / Android inline players.
 * 2. Automatic adaptive quality compression (q_auto / q_auto:eco) for instantaneous playback.
 * 3. Mobile resolution clamping (w_720 on mobile / w_1080 on desktop with c_limit).
 * 4. Progressive byte-range streaming (206 Partial Content) with zero upfront full downloads.
 */

const KNOWN_TRANSFORM_KEYS = 'q|w|h|f|c|vc|so|eo|du|sp|e|b|br|fps|ac|fl|co|bg|pg|ar|g|z|y|x';
const PARAM_REGEX = new RegExp(`^(${KNOWN_TRANSFORM_KEYS})_[a-zA-Z0-9.:_-]+$`);

export const isTransformSegment = (segment) => {
  if (!segment || typeof segment !== 'string') return false;
  // Version segment like v1729382901 is NOT a transformation
  if (/^v[0-9]+$/.test(segment)) return false;
  // Segments containing folder paths or public IDs are not transformations
  if (segment.includes('/')) return false;

  // Multiple comma-separated transformations (e.g. f_auto,q_auto,w_720)
  if (segment.includes(',')) {
    const parts = segment.split(',');
    return parts.length > 0 && parts.every((p) => PARAM_REGEX.test(p.trim()));
  }

  return PARAM_REGEX.test(segment.trim());
};

/**
 * Generates an optimized Cloudinary video delivery URL with universally supported H.264 MP4 delivery.
 * Strips any stale transform segments and injects mobile-compatible parameters.
 */
export const getOptimizedVideoUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  const {
    maxWidth = 1080,
    quality = 'q_auto',
    format = 'f_mp4', // Guaranteed standard MP4 container for 100% mobile compatibility
    codec = 'vc_h264', // Guaranteed H.264 Baseline/Main profile (hardware decoded everywhere)
    crop = 'c_limit',
  } = options;

  // Build clean transformation chain
  const transforms = [];
  if (format) transforms.push(format);
  if (quality) transforms.push(quality);
  if (codec) transforms.push(codec);
  if (maxWidth) transforms.push(`w_${maxWidth}`);
  if (crop) transforms.push(crop);
  const transformStr = transforms.join(',');

  const parts = url.split('/video/upload/');
  const prefix = parts[0] + '/video/upload/';
  const remainder = parts[1];
  const segments = remainder.split('/');

  // If the first segment is an existing transformation, replace it
  let assetSegments = segments;
  if (isTransformSegment(segments[0])) {
    assetSegments = segments.slice(1);
  }

  return `${prefix}${transformStr}/${assetSegments.join('/')}`;
};

/**
 * Generates a direct fallback video URL without resolution or codec constraints.
 * Used when an aggressive transformation encounters CDN or decoding stalls on an older device.
 */
export const getFallbackVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  const parts = url.split('/video/upload/');
  const prefix = parts[0] + '/video/upload/';
  const remainder = parts[1];
  const segments = remainder.split('/');

  let assetSegments = segments;
  if (isTransformSegment(segments[0])) {
    assetSegments = segments.slice(1);
  }

  // Safe universal MP4 transcode without resizing
  return `${prefix}f_mp4,vc_h264/${assetSegments.join('/')}`;
};

/**
 * Generates an optimized Cloudinary thumbnail / poster URL with f_auto, q_auto, and resolution capping.
 * Preserves specific video frame capture offsets (e.g., so_0 or so_2.5) if present.
 */
export const getOptimizedThumbnailUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com')) return url;

  const { width = 600, quality = 'q_auto' } = options;
  const isVideoUpload = url.includes('/video/upload/');
  const isImageUpload = url.includes('/image/upload/');

  if (!isVideoUpload && !isImageUpload) return url;

  const delimiter = isVideoUpload ? '/video/upload/' : '/image/upload/';
  const parts = url.split(delimiter);
  const prefix = parts[0] + delimiter;
  const remainder = parts[1];
  const segments = remainder.split('/');

  let assetSegments = segments;
  let existingStartOffset = '';
  if (isTransformSegment(segments[0])) {
    // Preserve frame timestamp offset if extracted from video (e.g. so_0 or so_2.5)
    const matchSo = segments[0].match(/so_[0-9.]+/);
    if (matchSo) existingStartOffset = `${matchSo[0]},`;
    assetSegments = segments.slice(1);
  }

  const transform = `${existingStartOffset}f_auto,${quality},w_${width},c_limit`;
  return `${prefix}${transform}/${assetSegments.join('/')}`;
};

/**
 * Returns true if the client environment is a touch/mobile device.
 * Used to avoid mounting unnecessary desktop hover video previews on phones and tablets.
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );
};

/**
 * Returns responsive video delivery parameters tailored for the user's screen width and network:
 * Mobile screens get 720p with q_auto:eco and H.264 to start instantly and prevent buffering.
 * Desktop screens get 1080p with q_auto and H.264 for crisp high-definition streaming.
 */
export const getDeviceOptimizedVideoUrl = (url, isPreview = false) => {
  if (typeof window === 'undefined') {
    return getOptimizedVideoUrl(url, {
      maxWidth: isPreview ? 720 : 1080,
      quality: isPreview ? 'q_auto:eco' : 'q_auto',
      format: 'f_mp4',
      codec: 'vc_h264',
    });
  }

  const isMobileScreen = window.innerWidth < 768;
  if (isPreview || isMobileScreen) {
    return getOptimizedVideoUrl(url, {
      maxWidth: 720,
      quality: 'q_auto:eco',
      format: 'f_mp4',
      codec: 'vc_h264',
    });
  }

  return getOptimizedVideoUrl(url, {
    maxWidth: 1080,
    quality: 'q_auto',
    format: 'f_mp4',
    codec: 'vc_h264',
  });
};

/**
 * Formats seconds or duration strings into standardized "m:ss" format.
 * Examples:
 *   9 -> "0:09"
 *   30 -> "0:30"
 *   65 -> "1:05"
 *   125 -> "2:05"
 *   "9s" -> "0:09"
 *   "0:9" -> "0:09"
 */
export const formatDuration = (val) => {
  if (val === undefined || val === null || val === '') return '';

  // If already mm:ss or m:ss (e.g. "0:09", "1:05", "0:9")
  if (typeof val === 'string' && /^\d+:\d{1,2}$/.test(val.trim())) {
    const [m, s] = val.trim().split(':').map(Number);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Parse numeric seconds from number or string like "9s", "30", "9.066667"
  const rawNum = typeof val === 'number' ? val : parseFloat(String(val).replace(/s$/i, '').trim());
  if (isNaN(rawNum) || rawNum < 0) return '';

  const totalSeconds = Math.round(rawNum);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};


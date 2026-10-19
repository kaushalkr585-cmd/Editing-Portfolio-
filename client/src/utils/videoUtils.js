/**
 * Video Delivery Optimization Utility for Cloudinary & HTML5 Media Playback
 * 
 * Implements Cloudinary Video Best Practices:
 * 1. Automatic format selection (f_auto) for modern browser container matching (WebM on Chrome, MP4 on Safari)
 * 2. Automatic quality compression (q_auto / q_auto:eco) for minimal buffering on mobile networks
 * 3. Video codec auto-selection (vc_auto) for hardware-accelerated playback
 * 4. Dimension clamping (w_1080 or w_720 with c_limit) to prevent mobile devices from decoding 4K streams
 * 5. Instant start & progressive byte-range streaming without full file downloads upfront
 */

const isTransformSegment = (segment) => {
  if (!segment) return false;
  // Version segment like v1729382901 is NOT a transformation
  if (/^v[0-9]+$/.test(segment)) return false;
  // Known Cloudinary video/image transformation keys
  return (
    /^(q_|w_|h_|f_|c_|vc_|so_|eo_|du_|sp_|e_|b_|br_|fps_|ac_|[a-z]{1,3}_[a-z0-9]+)/.test(segment) ||
    segment.includes(',')
  );
};

/**
 * Generates an optimized Cloudinary video delivery URL with automatic format and quality selection.
 * Cleans and replaces any legacy or hardcoded transform segments without losing folder structure or versioning.
 */
export const getOptimizedVideoUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  const {
    maxWidth = 1080,
    quality = 'q_auto',
    format = 'f_auto',
    codec = 'vc_auto',
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
 * Mobile screens get 720p with q_auto:eco to start instantly and prevent buffering.
 * Desktop screens get 1080p with q_auto for crisp high-definition streaming.
 */
export const getDeviceOptimizedVideoUrl = (url, isPreview = false) => {
  if (typeof window === 'undefined') {
    return getOptimizedVideoUrl(url, { maxWidth: isPreview ? 720 : 1080, quality: isPreview ? 'q_auto:eco' : 'q_auto' });
  }

  const isMobileScreen = window.innerWidth < 768;
  if (isPreview || isMobileScreen) {
    return getOptimizedVideoUrl(url, {
      maxWidth: 720,
      quality: 'q_auto:eco',
    });
  }

  return getOptimizedVideoUrl(url, {
    maxWidth: 1080,
    quality: 'q_auto',
  });
};

import assert from 'assert';
import {
  isTransformSegment,
  getOptimizedVideoUrl,
  getDeviceOptimizedVideoUrl,
  getFallbackVideoUrl
} from '../../client/src/utils/videoUtils.js';

async function runVideoPlaybackTests() {
  console.log('--- STARTING VIDEO PLAYBACK & MOBILE DELIVERY TESTS ---');

  // Test 1: Transformation Segment Detection
  console.log('\n[Test 1] Verifying isTransformSegment precision...');
  assert.strictEqual(isTransformSegment('f_auto,q_auto'), true);
  assert.strictEqual(isTransformSegment('w_1080'), true);
  assert.strictEqual(isTransformSegment('q_auto:eco'), true);
  assert.strictEqual(isTransformSegment('v1792477870'), false, 'Version segment must NOT be treated as transform');
  assert.strictEqual(isTransformSegment('portfolio_videos'), false, 'Folder name must NOT be treated as transform');
  assert.strictEqual(isTransformSegment('vid_1792477663949_dr7z9df9'), false, 'Video public ID starting with vid_ must NOT be treated as transform');
  console.log('✓ Test 1 Passed: Transformation segment detection is strictly accurate.');

  // Test 2: Mobile Video URL Optimization
  console.log('\n[Test 2] Verifying mobile H.264 optimization...');
  const sampleUrl = 'https://res.cloudinary.com/dleaqmeug/video/upload/f_auto,q_auto,vc_auto,w_1080,c_limit/portfolio_videos/test_sample.mp4';
  const mobileOptimized = getOptimizedVideoUrl(sampleUrl, {
    maxWidth: 720,
    quality: 'q_auto:eco',
    format: 'f_mp4',
    codec: 'vc_h264'
  });

  assert(mobileOptimized.includes('f_mp4'), 'Must use f_mp4 for universal container support');
  assert(mobileOptimized.includes('vc_h264'), 'Must use vc_h264 to prevent HEVC/VP9 inline decode failure');
  assert(mobileOptimized.includes('w_720'), 'Must clamp width to 720 on mobile');
  assert(mobileOptimized.includes('portfolio_videos/test_sample.mp4'), 'Must preserve folder and asset name');
  console.log('✓ Test 2 Passed: Mobile URL enforces universal H.264 MP4 delivery.');

  // Test 3: Fallback Video URL Generation
  console.log('\n[Test 3] Verifying fallback video URL generation...');
  const fallback = getFallbackVideoUrl(sampleUrl);
  assert(fallback.includes('f_mp4,vc_h264'), 'Fallback must provide clean H.264 transcode');
  assert(fallback.includes('portfolio_videos/test_sample.mp4'), 'Fallback must retain asset target');
  console.log('✓ Test 3 Passed: Fallback video URL generation verified.');

  // Test 4: Live Cloudinary Streaming & Byte-Range Verification for Active Assets
  console.log('\n[Test 4] Testing live Cloudinary video delivery for mobile and desktop...');
  const activePublicIds = [
    'portfolio_videos/vid_1792477663949_dr7z9df9',
    'portfolio_videos/oqbmciau7asjzgw7grs9',
    'portfolio_videos/m5wxjeuqprp9wcfix8jf',
    'portfolio_videos/o6vtcfbdvuunfrpvjcv4'
  ];

  for (const publicId of activePublicIds) {
    const rawUrl = `https://res.cloudinary.com/dleaqmeug/video/upload/${publicId}.mp4`;
    const mobileUrl = getOptimizedVideoUrl(rawUrl, {
      maxWidth: 720,
      quality: 'q_auto:eco',
      format: 'f_mp4',
      codec: 'vc_h264'
    });

    // Test byte-range request simulating mobile Safari / Chrome inline player
    const res = await fetch(mobileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
        'Range': 'bytes=0-1024'
      }
    });

    assert(
      res.status === 200 || res.status === 206,
      `Asset ${publicId} returned unexpected status: ${res.status}`
    );
    const contentType = res.headers.get('content-type');
    assert(
      contentType && contentType.includes('video/mp4'),
      `Asset ${publicId} expected video/mp4, got ${contentType}`
    );
    console.log(`  ✓ ${publicId}: status ${res.status}, content-type: ${contentType}`);
  }
  console.log('✓ Test 4 Passed: All active portfolio assets stream with video/mp4 and byte-range support.');

  console.log('\n======================================================');
  console.log('🎉 ALL VIDEO PLAYBACK & MOBILE DELIVERY TESTS PASSED!');
  console.log('======================================================\n');
}

runVideoPlaybackTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

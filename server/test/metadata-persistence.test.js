import assert from 'assert';
import { DataStore } from '../src/services/dataStore.js';
import { CloudinaryService } from '../src/services/cloudinary.service.js';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE METADATA PERSISTENCE TEST ---');

  // Test 1: Newly uploaded video saves custom title, category, description, and tags
  console.log('\n[Test 1] Saving project with custom title and category...');
  const proj1 = await DataStore.createProject({
    title: 'Mystry AMV Edit',
    category: 'AMV & Movie Edits',
    categoryId: 'cat-amv',
    description: 'Custom high-pace edit with beat sync.',
    tags: ['AMV', 'Anime', '4K'],
    videoUrl: 'https://res.cloudinary.com/dleaqmeug/video/upload/portfolio_videos/test_vid_1.mp4',
    thumbnailUrl: 'https://res.cloudinary.com/dleaqmeug/video/upload/portfolio_videos/test_vid_1.jpg',
    cloudinaryPublicId: 'portfolio_videos/test_vid_1',
    aspectRatio: '16:9',
    duration: '1:45',
    featured: true,
    published: true,
  });

  assert.strictEqual(proj1.title, 'Mystry AMV Edit');
  assert.strictEqual(proj1.category, 'AMV & Movie Edits');
  assert.strictEqual(proj1.description, 'Custom high-pace edit with beat sync.');
  console.log('✓ Test 1 Passed: Custom metadata correctly saved.');

  // Test 2: Uploading a second video does NOT modify the first project
  console.log('\n[Test 2] Uploading a second independent video...');
  const proj2 = await DataStore.createProject({
    title: 'Cinematic Car Commercial',
    category: 'Commercial Ads',
    categoryId: 'cat-commercials',
    description: 'Graded in DaVinci Resolve.',
    tags: ['Automotive', 'Cinematic'],
    videoUrl: 'https://res.cloudinary.com/dleaqmeug/video/upload/portfolio_videos/test_vid_2.mp4',
    thumbnailUrl: 'https://res.cloudinary.com/dleaqmeug/video/upload/portfolio_videos/test_vid_2.jpg',
    cloudinaryPublicId: 'portfolio_videos/test_vid_2',
    aspectRatio: '16:9',
    duration: '0:30',
    featured: false,
    published: true,
  });

  const checkProj1 = await DataStore.getProjectByIdOrSlug(proj1.id || proj1._id);
  assert.strictEqual(checkProj1.title, 'Mystry AMV Edit');
  assert.strictEqual(checkProj1.category, 'AMV & Movie Edits');
  assert.strictEqual(checkProj1.description, 'Custom high-pace edit with beat sync.');
  console.log('✓ Test 2 Passed: Second upload did not alter first project.');

  // Test 3: Editing title does not reset category or description
  console.log('\n[Test 3] Editing only the title of Project 1...');
  const updated1 = await DataStore.updateProject(proj1.id || proj1._id, {
    title: 'Mystry AMV Edit — Remastered',
  });
  assert.strictEqual(updated1.title, 'Mystry AMV Edit — Remastered');
  assert.strictEqual(updated1.category, 'AMV & Movie Edits');
  assert.strictEqual(updated1.description, 'Custom high-pace edit with beat sync.');
  assert.strictEqual(updated1.aspectRatio, '16:9');
  console.log('✓ Test 3 Passed: Editing title preserved category, description, and ratio.');

  // Test 4: Editing category does not reset title or thumbnail
  console.log('\n[Test 4] Editing only category of Project 1...');
  const updated2 = await DataStore.updateProject(proj1.id || proj1._id, {
    category: 'Anime Music Videos',
    categoryId: 'cat-amv',
  });
  assert.strictEqual(updated2.title, 'Mystry AMV Edit — Remastered');
  assert.strictEqual(updated2.category, 'Anime Music Videos');
  assert.strictEqual(updated2.thumbnailUrl, 'https://res.cloudinary.com/dleaqmeug/video/upload/portfolio_videos/test_vid_1.jpg');
  console.log('✓ Test 4 Passed: Editing category preserved title and thumbnail.');

  // Test 5: Partial update preserves all untouched fields
  console.log('\n[Test 5] Performing partial update with only tags and featured flag...');
  const updated3 = await DataStore.updateProject(proj1.id || proj1._id, {
    tags: ['UpdatedTag', 'Remix'],
    featured: false,
  });
  assert.strictEqual(updated3.title, 'Mystry AMV Edit — Remastered');
  assert.strictEqual(updated3.category, 'Anime Music Videos');
  assert.strictEqual(updated3.description, 'Custom high-pace edit with beat sync.');
  assert.strictEqual(updated3.featured, false);
  assert.deepStrictEqual(updated3.tags, ['UpdatedTag', 'Remix']);
  console.log('✓ Test 5 Passed: Partial update preserved untouched fields.');

  // Test 6: Cloudinary sync does NOT overwrite user-managed metadata
  console.log('\n[Test 6] Running Cloudinary sync against existing custom project...');
  // Mock Cloudinary response containing test_vid_1
  const origSync = CloudinaryService.syncVideosFromCloudinary;
  CloudinaryService.syncVideosFromCloudinary = async () => ({
    success: true,
    resources: [
      {
        public_id: 'portfolio_videos/test_vid_1',
        created_at: new Date().toISOString(),
        width: 1920,
        height: 1080,
      },
      {
        public_id: 'portfolio_videos/test_vid_2',
        created_at: new Date().toISOString(),
        width: 1920,
        height: 1080,
      },
    ],
  });

  const syncResult1 = await DataStore.syncProjectsFromCloudinary();
  const afterSyncProj1 = await DataStore.getProjectByIdOrSlug(proj1.id || proj1._id);
  assert.strictEqual(afterSyncProj1.title, 'Mystry AMV Edit — Remastered');
  assert.strictEqual(afterSyncProj1.category, 'Anime Music Videos');
  assert.strictEqual(afterSyncProj1.description, 'Custom high-pace edit with beat sync.');
  console.log('✓ Test 6 Passed: Cloudinary sync did not overwrite custom metadata.');

  // Test 7: Repeated sync operations do not create duplicates
  console.log('\n[Test 7] Running repeated sync operations...');
  const syncResult2 = await DataStore.syncProjectsFromCloudinary();
  assert.strictEqual(syncResult2.count, 0, 'No new duplicates should be created on repeated sync.');
  console.log('✓ Test 7 Passed: Repeated sync created zero duplicates.');

  // Cleanup test projects
  await DataStore.deleteProject(proj1.id || proj1._id);
  await DataStore.deleteProject(proj2.id || proj2._id);
  CloudinaryService.syncVideosFromCloudinary = origSync;

  console.log('\n=========================================');
  console.log('🎉 ALL 7 METADATA PERSISTENCE TESTS PASSED!');
  console.log('=========================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

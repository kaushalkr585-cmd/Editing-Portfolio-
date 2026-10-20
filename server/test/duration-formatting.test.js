import assert from 'assert';
import { formatDuration } from '../../client/src/utils/videoUtils.js';

async function runDurationTests() {
  console.log('--- STARTING VIDEO DURATION FORMATTING & PERSISTENCE TESTS ---');

  // Test 1: Standard Numeric Durations
  console.log('\n[Test 1] Testing standard numeric second values...');
  assert.strictEqual(formatDuration(9), '0:09', '9 seconds must format as 0:09');
  assert.strictEqual(formatDuration(30), '0:30', '30 seconds must format as 0:30');
  assert.strictEqual(formatDuration(65), '1:05', '65 seconds must format as 1:05');
  assert.strictEqual(formatDuration(125), '2:05', '125 seconds must format as 2:05');
  console.log('✓ Test 1 Passed: 9s (0:09), 30s (0:30), 65s (1:05), and 125s (2:05) formatted correctly.');

  // Test 2: Floating Point & Real Cloudinary Seconds
  console.log('\n[Test 2] Testing real Cloudinary fractional seconds...');
  assert.strictEqual(formatDuration(9.066667), '0:09', '9.066667s must round to 0:09');
  assert.strictEqual(formatDuration(18.538667), '0:19', '18.538667s must round to 0:19');
  assert.strictEqual(formatDuration(23.723708), '0:24', '23.723708s must round to 0:24');
  assert.strictEqual(formatDuration(30.570667), '0:31', '30.570667s must round to 0:31');
  console.log('✓ Test 2 Passed: Cloudinary fractional values rounded and formatted accurately.');

  // Test 3: String Inputs and Pre-formatted Durations
  console.log('\n[Test 3] Testing string durations ("9s", "0:9", "0:09")...');
  assert.strictEqual(formatDuration('9s'), '0:09');
  assert.strictEqual(formatDuration('65s'), '1:05');
  assert.strictEqual(formatDuration('0:09'), '0:09');
  assert.strictEqual(formatDuration('1:5'), '1:05');
  assert.strictEqual(formatDuration(''), '');
  assert.strictEqual(formatDuration(null), '');
  assert.strictEqual(formatDuration(undefined), '');
  console.log('✓ Test 3 Passed: String inputs, legacy formats, and null/undefined handled safely.');

  // Test 4: Verify No 0:30 Hardcoded Overwrites in DataStore
  console.log('\n[Test 4] Verifying DataStore projects duration values...');
  const { DataStore } = await import('../src/services/dataStore.js');
  const projects = await DataStore.getProjects({ publishedOnly: false });
  assert(projects.length > 0, 'Must have active projects');

  const juggProject = projects.find(p => p.cloudinaryPublicId === 'portfolio_videos/o6vtcfbdvuunfrpvjcv4');
  if (juggProject) {
    assert.strictEqual(
      juggProject.duration,
      '0:09',
      `Jugg Style Edit (9s video) must have duration 0:09, but got ${juggProject.duration}`
    );
    console.log(`✓ Test 4 Passed: 9s video correctly reports duration ${juggProject.duration} instead of 0:30.`);
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL VIDEO DURATION FORMATTING & PERSISTENCE TESTS PASSED!');
  console.log('=============================================================\n');
}

runDurationTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

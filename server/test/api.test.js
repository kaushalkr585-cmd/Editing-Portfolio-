import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Full System Integration Tests...\n');
  let testsPassed = 0;
  let testsFailed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      testsPassed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      testsFailed++;
    }
  }

  // 1. Healthcheck
  await test('Health check returns status ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
  });

  // 2. Projects
  await test('GET /api/projects returns 12 initial projects', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length >= 12, true);
  });

  await test('GET /api/projects?category=SaaS & Product filters properly', async () => {
    const res = await fetch(`${BASE_URL}/api/projects?category=${encodeURIComponent('SaaS & Product')}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length > 0, true);
    data.data.forEach(p => assert.strictEqual(p.category, 'SaaS & Product'));
  });

  await test('GET /api/projects?search=Cyberpunk finds matching project', async () => {
    const res = await fetch(`${BASE_URL}/api/projects?search=Cyberpunk`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length > 0, true);
  });

  // 3. Services
  await test('GET /api/services returns all 12 services', async () => {
    const res = await fetch(`${BASE_URL}/api/services`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length, 12);
  });

  // 4. Contact Form Validation & Submission
  await test('POST /api/inquiries rejects invalid email', async () => {
    const res = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester',
        email: 'invalid-email',
        projectType: 'SaaS',
        description: 'Valid project description that is long enough.',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await test('POST /api/inquiries accepts valid inquiry', async () => {
    const res = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Tester',
        email: 'tester@brand.com',
        projectType: 'Commercials',
        description: 'Need a 30s broadcast commercial with high energy and DaVinci color grading.',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.inquiryId);
  });

  // 5. AI Assistant Endpoints
  await test('POST /api/ai/brief returns structured production brief', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectType: 'AMVs',
        platform: 'TikTok & YouTube Shorts',
        duration: '30s',
        desiredStyle: 'Velocity curves, frame impact glitches, beat drops',
      }),
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.briefTitle);
    assert.ok(Array.isArray(data.data.hookStrategy));
    assert.ok(data.data.aspectRatio);
  });

  await test('POST /api/ai/recommend matches services and projects', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'I need an anime edit with beat sync',
      }),
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.recommendedServices.length > 0);
  });

  // 6. Security: Unauthorized Project Creation Blocked
  await test('POST /api/projects blocks unauthorized request with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Hacked Project',
        category: 'AMVs',
        description: 'Should fail',
        videoUrl: 'http://evil.com/video.mp4',
      }),
    });
    assert.strictEqual(res.status, 401);
  });

  // 7. Auth: Setup / Login / Me flow
  let adminToken = '';
  await test('POST /api/auth/setup creates admin or login authenticates admin', async () => {
    const statusRes = await fetch(`${BASE_URL}/api/auth/status`);
    const statusData = await statusRes.json();

    if (!statusData.initialized) {
      const setupRes = await fetch(`${BASE_URL}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'kaushalkumar',
          email: 'kaushal@portfolio.com',
          password: 'SecureAdminPassword2026!',
        }),
      });
      const setupData = await setupRes.json();
      assert.strictEqual(setupRes.status, 201);
      assert.ok(setupData.token);
      adminToken = setupData.token;
    } else {
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'kaushalkumar',
          password: 'SecureAdminPassword2026!',
        }),
      });
      const loginData = await loginRes.json();
      assert.strictEqual(loginRes.status, 200);
      assert.ok(loginData.token);
      adminToken = loginData.token;
    }
  });

  await test('GET /api/auth/me succeeds with valid Bearer token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'admin');
  });

  // 8. Admin Project CRUD
  let createdProjId = '';
  await test('POST /api/projects creates new project with admin auth', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Nebula Esports Tournament Teaser',
        category: 'Gaming',
        description: 'High-octane tournament teaser with 3D text and motion tracking.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop',
        duration: '0:35',
        aspectRatio: '16:9',
        featured: true,
        published: true,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    createdProjId = data.data._id || data.data.id;
    assert.ok(createdProjId);
  });

  await test('PUT /api/projects/:id updates project', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${createdProjId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Nebula Esports Tournament Teaser (Updated)',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.title, 'Nebula Esports Tournament Teaser (Updated)');
  });

  await test('DELETE /api/projects/:id deletes project', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${createdProjId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  console.log(`\n========================================`);
  console.log(`Integration Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();

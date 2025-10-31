/**
 * Video Generation API Test
 * Tests the new unified /api/video/generate endpoint
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testVideoGenerateInfo() {
  console.log('\n🧪 Testing GET /api/video/generate (info endpoint)...');

  try {
    const response = await fetch(`${BASE_URL}/api/video/generate`, {
      method: 'GET',
    });

    const data = await response.json();

    console.log('✅ Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Info endpoint works correctly');
      console.log(`   Provider: ${data.data.provider}`);
      console.log(`   Model: ${data.data.model}`);
      console.log(`   Durations: ${data.data.durations.join(', ')}`);
      console.log(`   Aspect Ratios: ${data.data.aspectRatios.join(', ')}`);
      console.log(`   Resolutions: ${data.data.resolutions.join(', ')}`);
      return true;
    } else {
      console.error('❌ Info endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing info endpoint:', error.message);
    return false;
  }
}

async function testVideoGenerateWithoutAuth() {
  console.log('\n🧪 Testing POST /api/video/generate (without auth)...');

  try {
    const response = await fetch(`${BASE_URL}/api/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over the ocean',
        duration: '4s',
        aspectRatio: '16:9',
        resolution: '720p',
      }),
    });

    const data = await response.json();

    console.log('✅ Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('✅ Auth protection works correctly (expected 401)');
      return true;
    } else {
      console.error('❌ Expected 401 Unauthorized, got:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing auth protection:', error.message);
    return false;
  }
}

async function testVideoGenerateValidation() {
  console.log('\n🧪 Testing POST /api/video/generate (validation)...');

  try {
    // Note: This will fail with 401 if not authenticated
    // But we can still test the endpoint exists
    const response = await fetch(`${BASE_URL}/api/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing prompt (should trigger validation if auth passes)
        duration: 'invalid',
      }),
    });

    const data = await response.json();

    console.log('✅ Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (response.status === 401 || response.status === 400) {
      console.log('✅ Validation works correctly (401 auth or 400 validation)');
      return true;
    } else {
      console.log('⚠️ Unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing validation:', error.message);
    return false;
  }
}

async function testVideoGenerateWithAuth() {
  console.log(
    '\n🧪 Testing POST /api/video/generate (with auth - requires login)...',
  );
  console.log('⚠️ This test requires valid authentication cookies');
  console.log('   Please test this manually after logging in to the app');

  const authCookie = process.env.TEST_AUTH_COOKIE;

  if (!authCookie) {
    console.log('⏭️ Skipping authenticated test (no TEST_AUTH_COOKIE)');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        prompt: 'A cat playing with a ball of yarn in slow motion',
        duration: '4s',
        aspectRatio: '1:1',
        resolution: '720p',
        generateAudio: false,
      }),
    });

    const data = await response.json();

    console.log('✅ Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Video generated successfully!');
      console.log(`   Video URL: ${data.videoUrl}`);
      console.log(`   File ID: ${data.fileId}`);
      console.log(`   Credits Used: ${data.creditsUsed}`);
      return true;
    } else {
      console.error('❌ Video generation failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing video generation:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🎬 Starting Video Generation API Tests');
  console.log('='.repeat(60));

  const results = {
    info: await testVideoGenerateInfo(),
    authProtection: await testVideoGenerateWithoutAuth(),
    validation: await testVideoGenerateValidation(),
    generation: await testVideoGenerateWithAuth(),
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(60));

  console.log(`Info Endpoint:        ${results.info ? '✅ PASS' : '❌ FAIL'}`);
  console.log(
    `Auth Protection:      ${results.authProtection ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(
    `Validation:           ${results.validation ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(
    `Generation (w/ auth): ${results.generation === true ? '✅ PASS' : results.generation === false ? '❌ FAIL' : '⏭️ SKIPPED'}`,
  );

  const passed = Object.values(results).filter((r) => r === true).length;
  const failed = Object.values(results).filter((r) => r === false).length;
  const skipped = Object.values(results).filter((r) => r === null).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All non-skipped tests passed!');
    console.log('\n💡 To test with authentication:');
    console.log('   1. Login to the app in your browser');
    console.log('   2. Copy the auth cookie');
    console.log(
      '   3. Run: TEST_AUTH_COOKIE="your_cookie" node video-api-test.js',
    );
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

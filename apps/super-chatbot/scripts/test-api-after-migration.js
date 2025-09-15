#!/usr/bin/env node

/**
 * Test API after migration is applied
 */

const { exec } = require('child_process');

async function testAPI() {
  console.log('🧪 Testing API after migration...');
  console.log('');

  console.log('📋 Test steps:');
  console.log('1. Apply the migration (see previous output)');
  console.log('2. Start the development server:');
  console.log('   npm run dev');
  console.log('3. Test the Story Editor API:');
  console.log('   POST http://localhost:3000/api/story-editor/generate');
  console.log('');

  console.log('🔍 What to check:');
  console.log('- Project creation should work without database errors');
  console.log('- Project should be saved with status "pending"');
  console.log('- Status should update to "processing"');
  console.log('- Balance should be deducted after successful creation');
  console.log('- If Prefect fails, credits should be refunded');
  console.log('');

  console.log('📊 Check database after test:');
  console.log('SELECT "projectId", "status", "creditsUsed", "errorMessage" FROM "UserProject" ORDER BY "createdAt" DESC LIMIT 5;');
  console.log('');

  console.log('✅ If migration is applied, API should work perfectly!');
}

testAPI();




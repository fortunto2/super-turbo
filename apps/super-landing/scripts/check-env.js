#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Environment Variables Check Script
 * 
 * Usage:
 * node scripts/check-env.js
 */

const requiredVars = [
  'AZURE_OPENAI_RESOURCE_NAME',
  'AZURE_OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPERDUPERAI_TOKEN'
];

const optionalVars = [
  'REDIS_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID',
  'LANGCHAIN_API_KEY'
];

console.log('🔍 Checking Environment Variables...\n');

// Check required variables
console.log('📋 REQUIRED VARIABLES:');
let missingRequired = 0;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your_') || value.includes('sk_test_your_') || value.includes('whsec_your_')) {
    console.log(`❌ ${varName}: NOT SET or using placeholder value`);
    missingRequired++;
  } else {
    console.log(`✅ ${varName}: SET (${value.substring(0, 10)}...)`);
  }
});

console.log('\n📋 OPTIONAL VARIABLES:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  } else {
    console.log(`✅ ${varName}: SET (${value.substring(0, 20)}...)`);
  }
});

console.log('\n📊 SUMMARY:');
if (missingRequired === 0) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Ready for production deployment.');
} else {
  console.log(`❌ ${missingRequired} required environment variables are missing or using placeholder values.`);
  console.log('⚠️  Please set the required variables before deploying to production.');
}

console.log('\n💡 TIP: Copy env.example to .env.local and fill in your actual values.'); 
#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Azure OpenAI Configuration Check Script
 *
 * Usage:
 * node scripts/check-azure-openai.js
 */

const requiredVars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_RESOURCE_NAME'];

const optionalVars = [
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_API_VERSION',
  'AZURE_OPENAI_REGION',
  'AZURE_GPT41_DEPLOYMENT_NAME',
  'AZURE_O4MINI_DEPLOYMENT_NAME',
  'AZURE_O3_DEPLOYMENT_NAME',
  'AZURE_O3_PRO_DEPLOYMENT_NAME',
];

console.log('🔍 Checking Azure OpenAI Configuration...\n');

// Check required variables
console.log('📋 REQUIRED VARIABLES:');
let allRequiredPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 OPTIONAL VARIABLES:');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (using default)`);
  }
});

// Test Azure OpenAI connection if API key is present
if (
  process.env.AZURE_OPENAI_API_KEY &&
  process.env.AZURE_OPENAI_RESOURCE_NAME
) {
  console.log('\n🔗 Testing Azure OpenAI Connection...');

  const endpoint =
    process.env.AZURE_OPENAI_ENDPOINT ||
    `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com/`;

  console.log(`Endpoint: ${endpoint}`);
  console.log(
    `API Version: ${process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'}`,
  );
  console.log(`Region: ${process.env.AZURE_OPENAI_REGION || 'eastus2'}`);

  // Note: Actual connection test would require making an API call
  console.log('ℹ️  To test actual connection, make a test API call');
}

console.log('\n📊 SUMMARY:');
if (allRequiredPresent) {
  console.log('✅ All required Azure OpenAI variables are set');
  console.log('🚀 Azure OpenAI should work correctly');
} else {
  console.log('❌ Some required Azure OpenAI variables are missing');
  console.log('🔧 Please set the missing variables in your .env file');
  console.log('📖 See env.example for reference');
}

console.log('\n💡 TROUBLESHOOTING:');
console.log('1. Check if your Azure OpenAI API key is valid and not expired');
console.log('2. Verify the resource name matches your Azure OpenAI resource');
console.log('3. Ensure the endpoint URL is correct for your region');
console.log('4. Check if your Azure subscription is active');
console.log(
  '5. Verify the deployment names exist in your Azure OpenAI resource',
);

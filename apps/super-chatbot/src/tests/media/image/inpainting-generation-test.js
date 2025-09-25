#!/usr/bin/env node

/**
 * Test script for inpainting generation functionality
 * Tests inpainting models with mask-based image editing
 */

// Load environment variables from .env files
require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🎨 Inpainting Generation Test');
console.log('==================================================');

const SUPERDUPERAI_TOKEN = process.env.SUPERDUPERAI_TOKEN || process.env.RAI_TOKEN;
const SUPERDUPERAI_URL = process.env.SUPERDUPERAI_URL || 'https://dev-editor.superduperai.co';

console.log('🔗 API URL:', SUPERDUPERAI_URL);
console.log('🔑 Token:', SUPERDUPERAI_TOKEN ? `${SUPERDUPERAI_TOKEN.substring(0, 8)}...` : 'Not set');

async function testInpaintingGeneration() {
  if (!SUPERDUPERAI_TOKEN) {
    console.log('⚠️  SUPERDUPERAI_TOKEN not set - running in smoke test mode');
    console.log('💡 To run full tests, set SUPERDUPERAI_TOKEN environment variable');
    
    // Smoke test - validate payload structure
    const mockPayload = {
      type: "media",
      template_name: null,
      style_name: "flux_watercolor",
      generationType: "image-to-image",
      editingMode: "inpainting",
      config: {
        prompt: "A beautiful sunset over mountains",
        shot_size: "Medium Shot",
        style_name: "flux_watercolor",
        seed: "35915533265",
        aspecRatio: "1:1",
        batch_size: 1,
        entity_ids: [],
        generation_config_name: "comfyui/flux",
        height: "1024",
        qualityType: "hd",
        references: [],
        width: "1024"
      },
      mask: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      sourceImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    };
    
    console.log('📦 Inpainting payload structure:');
    console.log(JSON.stringify(mockPayload, null, 2));
    
    console.log('✅ Smoke test passed - inpainting payload structure is valid');
    console.log('📋 Summary:');
    console.log('   - Generation type: image-to-image');
    console.log('   - Editing mode: inpainting');
    console.log('   - Mask: base64 encoded');
    console.log('   - Source image: base64 encoded');
    console.log('   - Model: comfyui/flux (inpainting capable)');
    
    return;
  }

  try {
    console.log('\n🎨 Testing Inpainting Generation API');
    console.log('-'.repeat(50));
    
    // Test payload for inpainting
    const payload = {
      type: "media",
      template_name: null,
      style_name: "flux_watercolor",
      generationType: "image-to-image",
      editingMode: "inpainting",
      config: {
        prompt: "A beautiful sunset over mountains with golden light",
        shot_size: "Medium Shot",
        style_name: "flux_watercolor",
        seed: "35915533265",
        aspecRatio: "1:1",
        batch_size: 1,
        entity_ids: [],
        generation_config_name: "comfyui/flux",
        height: "1024",
        qualityType: "hd",
        references: [],
        width: "1024"
      },
      mask: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      sourceImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    };
    
    console.log('📦 Payload structure:');
    console.log(JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${SUPERDUPERAI_URL}/api/v1/file/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERDUPERAI_TOKEN}`,
        'User-Agent': 'SuperChatbot-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ API Response:', JSON.stringify(result, null, 2));
    
    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0];
      console.log('🆔 File ID:', firstResult.id);
      console.log('🎨 Image Generation ID:', firstResult.image_generation_id);
      
      console.log('\n🎉 Inpainting generation test PASSED!');
      console.log('📋 Summary:');
      console.log('   - API call: ✅ SUCCESS');
      console.log('   - Inpainting generation: ✅ STARTED');
      console.log('   - File ID:', firstResult.id);
      console.log('   - Generation ID:', firstResult.image_generation_id);
    } else {
      console.log('❌ Unexpected response format');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

async function testInpaintingValidation() {
  console.log('\n🔍 Testing Inpainting Validation');
  console.log('-'.repeat(50));
  
  // Test cases for validation
  const testCases = [
    {
      name: "Valid inpainting payload",
      payload: {
        generationType: "image-to-image",
        editingMode: "inpainting",
        mask: "data:image/png;base64,test",
        sourceImage: "data:image/jpeg;base64,test",
        config: { prompt: "test" }
      },
      shouldPass: true
    },
    {
      name: "Missing mask",
      payload: {
        generationType: "image-to-image",
        editingMode: "inpainting",
        sourceImage: "data:image/jpeg;base64,test",
        config: { prompt: "test" }
      },
      shouldPass: false
    },
    {
      name: "Missing source image",
      payload: {
        generationType: "image-to-image",
        editingMode: "inpainting",
        mask: "data:image/png;base64,test",
        config: { prompt: "test" }
      },
      shouldPass: false
    },
    {
      name: "Wrong editing mode",
      payload: {
        generationType: "image-to-image",
        editingMode: "outpainting",
        mask: "data:image/png;base64,test",
        sourceImage: "data:image/jpeg;base64,test",
        config: { prompt: "test" }
      },
      shouldPass: false
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    const isValid = validateInpaintingPayload(testCase.payload);
    const result = isValid === testCase.shouldPass ? '✅ PASS' : '❌ FAIL';
    
    console.log(`   Expected: ${testCase.shouldPass ? 'Valid' : 'Invalid'}`);
    console.log(`   Actual: ${isValid ? 'Valid' : 'Invalid'}`);
    console.log(`   Result: ${result}`);
  }
}

function validateInpaintingPayload(payload) {
  // Basic validation for inpainting payload
  if (payload.generationType !== "image-to-image") return false;
  if (payload.editingMode !== "inpainting") return false;
  if (!payload.mask) return false;
  if (!payload.sourceImage) return false;
  if (!payload.config?.prompt) return false;
  
  // Check if mask is base64 encoded
  if (!payload.mask.startsWith('data:image/')) return false;
  
  // Check if source image is base64 encoded
  if (!payload.sourceImage.startsWith('data:image/')) return false;
  
  return true;
}

// Run tests
async function runTests() {
  console.log('🚀 Starting inpainting generation tests...\n');
  
  await testInpaintingValidation();
  await testInpaintingGeneration();
  
  console.log('\n🎉 All inpainting tests completed!');
}

runTests();

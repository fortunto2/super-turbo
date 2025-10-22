import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ GOOGLE_AI_API_KEY not found in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

console.log('🔍 Fetching available Gemini models...\n');

try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  const data = await response.json();

  if (data.error) {
    console.error('❌ Error:', data.error.message);
    process.exit(1);
  }

  console.log('✅ Available models that support generateContent:\n');

  const generateContentModels = data.models.filter(model =>
    model.supportedGenerationMethods?.includes('generateContent')
  );

  generateContentModels.forEach(model => {
    console.log(`📦 ${model.name.replace('models/', '')}`);
    console.log(`   Description: ${model.description}`);
    console.log(`   Display Name: ${model.displayName}`);
    console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
    console.log('');
  });

  console.log(`\n✅ Total: ${generateContentModels.length} models support generateContent`);

} catch (error) {
  console.error('❌ Failed to fetch models:', error.message);
  process.exit(1);
}

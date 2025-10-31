// Тестовый скрипт для проверки Google AI API ключа
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

// Загружаем .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_AI_API_KEY;

console.log('🔑 Проверка Google AI API ключа...');
console.log('📋 Ключ начинается с:', `${apiKey?.substring(0, 10)}...`);
console.log('📏 Длина ключа:', apiKey?.length);

// Проверяем формат ключа
if (!apiKey) {
  console.error('❌ ОШИБКА: GOOGLE_AI_API_KEY не найден в .env.local');
  process.exit(1);
}

if (!apiKey.startsWith('AIza')) {
  console.warn('⚠️  ВНИМАНИЕ: Ваш ключ не начинается с "AIza"');
  console.warn('⚠️  Это может быть Vertex AI ключ, а не Google AI Studio ключ');
  console.warn('');
  console.warn('Получите правильный ключ здесь:');
  console.warn('👉 https://aistudio.google.com/app/apikey');
  console.warn('');
}

// Пробуем использовать ключ
try {
  console.log('🧪 Попытка подключения к Google AI...');

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  });

  const model = google('gemini-1.5-flash-latest');

  console.log('📡 Отправка тестового запроса...');

  const result = await generateText({
    model: model,
    prompt: 'Say "Hello" in one word',
  });

  console.log('✅ УСПЕХ! API ключ работает!');
  console.log('📝 Ответ от Gemini:', result.text);
  console.log('');
  console.log('🎉 Ваш чатбот готов к работе!');
} catch (error) {
  console.error('❌ ОШИБКА при проверке ключа:');
  console.error(error.message);
  console.error('');

  if (error.message.includes('OAuth2')) {
    console.error('🔍 Диагностика:');
    console.error('   Ваш ключ требует OAuth2, что означает:');
    console.error('   1. Это Vertex AI ключ (не Google AI Studio)');
    console.error('   2. Нужно получить НОВЫЙ ключ');
    console.error('');
    console.error('✅ Решение:');
    console.error('   1. Откройте: https://aistudio.google.com/app/apikey');
    console.error('   2. Войдите через Google аккаунт');
    console.error('   3. Нажмите "Create API Key"');
    console.error('   4. Скопируйте ключ (должен начинаться с AIza...)');
    console.error('   5. Замените GOOGLE_AI_API_KEY в .env.local');
  } else if (error.statusCode === 400) {
    console.error('🔍 Диагностика: Неправильный формат API ключа');
    console.error('✅ Решение: Получите новый ключ из Google AI Studio');
  } else {
    console.error('🔍 Полная ошибка:', error);
  }

  process.exit(1);
}

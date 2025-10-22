/**
 * Test Google AI API Key для генерации видео
 *
 * Этот тест проверяет, работает ли ваш GOOGLE_AI_API_KEY для Veo 3.1
 * Ожидаемый результат: Ошибка "API keys are not supported"
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testGoogleApiKeyDirectly() {
  console.log('\n🧪 Testing Google Veo API with GOOGLE_AI_API_KEY directly...');
  console.log('⚠️ Ожидаем ошибку - Google требует OAuth2, а не API ключ\n');

  // Читаем API ключ из переменной окружения
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.log('❌ GOOGLE_AI_API_KEY not found in environment');
    console.log('💡 Установите переменную: GOOGLE_AI_API_KEY=ваш_ключ');
    return false;
  }

  console.log('✅ GOOGLE_AI_API_KEY found:', `${apiKey.substring(0, 10)}...`);

  const GOOGLE_VEO_API = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';

  try {
    console.log('🚀 Calling Google Veo API...');

    const response = await fetch(GOOGLE_VEO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: 'A beautiful sunset over the ocean with waves',
          },
        ],
        parameters: {
          aspectRatio: '16:9',
          resolution: '720p',
          durationSeconds: 4,
        },
      }),
    });

    const responseText = await response.text();

    console.log('\n📋 Response Status:', response.status);
    console.log('📋 Response Body:', responseText);

    if (response.status === 400 && responseText.includes('API keys are not supported')) {
      console.log('\n✅ Получили ожидаемую ошибку!');
      console.log('   Google Veo API НЕ поддерживает API ключи');
      console.log('   Требуется OAuth2 токен');
      return 'expected_error';
    }

    if (response.ok) {
      console.log('\n🎉 НЕОЖИДАННО! API ключ сработал!');
      console.log('   Это значит Google изменил политику');
      const data = JSON.parse(responseText);
      console.log('   Operation name:', data.name);
      return true;
    }

    console.log('\n⚠️ Неожиданный ответ от API');
    return false;
  } catch (error) {
    console.error('❌ Error calling Google Veo API:', error.message);
    return false;
  }
}

async function testThroughOurEndpoint() {
  console.log('\n🧪 Testing через наш endpoint /api/video/generate-google...');

  try {
    const response = await fetch(`${BASE_URL}/api/video/generate-google`, {
      method: 'GET',
    });

    const data = await response.json();

    console.log('✅ Response status:', response.status);
    console.log('📋 Endpoint info:', JSON.stringify(data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🎬 Тестирование Google AI API Key для Video Generation');
  console.log('='.repeat(60));

  const directResult = await testGoogleApiKeyDirectly();
  const endpointResult = await testThroughOurEndpoint();

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Результаты Тестов');
  console.log('='.repeat(60));

  if (directResult === 'expected_error') {
    console.log('\n✅ ВЫВОД: Ваш GOOGLE_AI_API_KEY НЕ работает для Veo');
    console.log('   Причина: Google требует OAuth2, а не API ключ');
    console.log('\n💡 РЕШЕНИЕ:');
    console.log('   1. Используйте /api/video/generate (Fal.ai)');
    console.log('   2. Получите Fal.ai ключ: https://fal.ai');
    console.log('   3. Добавьте в .env.local: FAL_KEY=ваш_ключ');
    console.log('\n📚 Подробнее:');
    console.log('   - VERTEX_AI_EXPLANATION.md');
    console.log('   - VIDEO_API_SETUP.md');
  } else if (directResult === true) {
    console.log('\n🎉 ВЫВОД: Ваш GOOGLE_AI_API_KEY РАБОТАЕТ для Veo!');
    console.log('   Google изменил политику!');
    console.log('\n💡 МОЖЕТЕ ИСПОЛЬЗОВАТЬ:');
    console.log('   - /api/video/generate-google (напрямую Google)');
    console.log('   - /api/video/generate (Fal.ai - резервный)');
  } else {
    console.log('\n⚠️ ВЫВОД: Неожиданный результат теста');
    console.log('   Проверьте логи выше для деталей');
  }

  console.log(`\n${'='.repeat(60)}`);
}

// Запуск тестов
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

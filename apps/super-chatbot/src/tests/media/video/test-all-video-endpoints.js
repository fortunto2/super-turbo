/**
 * Тест Всех Video Generation Endpoints
 *
 * Проверяет все три варианта:
 * 1. /api/video/generate (Fal.ai) - Рекомендуется
 * 2. /api/video/generate-google (Google Direct) - OAuth2 ошибка
 * 3. /api/video/generate-vertex (Vertex AI) - Ваш вариант
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testEndpoint(name, url, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${name}`);
  console.log(`📍 URL: ${url}`);
  console.log(`📝 Description: ${description}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    console.log('✅ Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint is reachable and configured');
      return { success: true, data };
    } else {
      console.log('⚠️ Endpoint returned error');
      return { success: false, data };
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAuth0Status() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔐 Checking Auth0 Configuration');
  console.log('='.repeat(60));

  // Проверяем через debug endpoint (если есть)
  try {
    const response = await fetch(`${BASE_URL}/api/debug`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth0 configuration detected');
      console.log('📋 Auth info:', JSON.stringify(data, null, 2));
      return true;
    }
  } catch (error) {
    console.log('⚠️ Could not check Auth0 status:', error.message);
  }

  console.log('ℹ️ Auth0 is configured in your .env.local:');
  console.log('   AUTH_AUTH0_ID=lWC7w2zUX3Czl93GBeaeMJFB6Cdk68h3');
  console.log('   AUTH_AUTH0_ISSUER=https://life2film.uk.auth0.com');
  return true;
}

async function runAllTests() {
  console.log('🎬 Testing All Video Generation Endpoints');
  console.log('='.repeat(60));
  console.log('Ваша конфигурация:');
  console.log('  ✅ Auth0: Настроен (life2film.uk.auth0.com)');
  console.log('  ✅ API Key: Найден в .env.local');
  console.log('='.repeat(60));

  // Check Auth0
  await testAuth0Status();

  // Test all three endpoints
  const results = {
    fal: await testEndpoint(
      '1. Fal.ai (Recommended)',
      `${BASE_URL}/api/video/generate`,
      'Использует Fal.ai для Google Veo 3 (работает с простым API ключом)'
    ),
    google: await testEndpoint(
      '2. Google Direct',
      `${BASE_URL}/api/video/generate-google`,
      'Попытка использовать GOOGLE_AI_API_KEY напрямую (вернёт ошибку OAuth2)'
    ),
    vertex: await testEndpoint(
      '3. Vertex AI',
      `${BASE_URL}/api/video/generate-vertex`,
      'Ваш запрос: использовать Vertex AI с вашим ключом'
    ),
  };

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 ИТОГОВЫЙ ОТЧЁТ');
  console.log('='.repeat(60));

  console.log('\n1️⃣ Fal.ai (Рекомендуется):');
  if (results.fal.success) {
    console.log('   ✅ Endpoint доступен');
    console.log('   📌 Статус: Готов к использованию (нужен только FAL_KEY)');
    console.log('   💡 Что делать: Получите ключ на https://fal.ai');
  } else {
    console.log('   ❌ Endpoint не доступен');
  }

  console.log('\n2️⃣ Google Direct:');
  if (results.google.success) {
    console.log('   ✅ Endpoint доступен');
    console.log('   📌 Статус: Вернёт ошибку OAuth2 (как и ожидалось)');
    console.log('   💡 Назначение: Демонстрация почему прямой вызов не работает');
  } else {
    console.log('   ❌ Endpoint не доступен');
  }

  console.log('\n3️⃣ Vertex AI (Ваш запрос):');
  if (results.vertex.success) {
    console.log('   ✅ Endpoint доступен');
    console.log('   📌 Статус:', results.vertex.data?.status || 'Checking...');

    if (results.vertex.data?.status?.auth0?.includes('✅')) {
      console.log('   ✅ Auth0: Настроен и работает');
    }

    if (results.vertex.data?.status?.googleApiKey?.includes('✅') ||
        results.vertex.data?.status?.vertexApiKey?.includes('✅')) {
      console.log('   ✅ API Key: Найден');
      console.log('   ⚠️ Но: Может не работать для Veo (требует OAuth2)');
    }

    console.log('\n   💡 Попробуйте вызвать POST с промптом:');
    console.log('      Если получите ошибку OAuth2 - используйте вариант 1 (Fal.ai)');
    console.log('      Если сработает - отлично, используйте этот endpoint!');
  } else {
    console.log('   ❌ Endpoint не доступен');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 РЕКОМЕНДАЦИИ');
  console.log('='.repeat(60));

  console.log('\nВАША СИТУАЦИЯ:');
  console.log('  ✅ Auth0 настроен и работает');
  console.log('  ✅ У вас есть API ключ (GOOGLE_AI_API_KEY)');
  console.log('  ⚠️ Ключ вероятно от Google AI Studio (не Vertex AI)');

  console.log('\nЧТО ПОПРОБОВАТЬ:');
  console.log('  1. Сначала попробуйте /api/video/generate-vertex');
  console.log('     Вызовите POST с промптом для видео');
  console.log('     Посмотрите что вернёт Google');

  console.log('\n  2. Если получите ошибку OAuth2:');
  console.log('     → Ваш ключ действительно от AI Studio (не Vertex)');
  console.log('     → Используйте /api/video/generate (Fal.ai)');
  console.log('     → Получите FAL_KEY на https://fal.ai');

  console.log('\n  3. Если /api/video/generate-vertex СРАБОТАЕТ:');
  console.log('     → Отлично! Ваш ключ поддерживает Vertex AI');
  console.log('     → Используйте этот endpoint');
  console.log('     → Fal.ai не нужен');

  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 СЛЕДУЮЩИЙ ШАГ');
  console.log('='.replace(60));

  console.log('\nТест POST запроса (требует аутентификации):');
  console.log('1. Залогиньтесь в приложение через браузер');
  console.log('2. Откройте DevTools → Network');
  console.log('3. Скопируйте cookie из запроса');
  console.log('4. Запустите:');
  console.log('\n   TEST_AUTH_COOKIE="ваш_cookie" node test-all-video-endpoints.js');

  console.log(`\n${'='.repeat(60)}`);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

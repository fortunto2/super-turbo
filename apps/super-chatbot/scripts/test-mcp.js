#!/usr/bin/env node

/**
 * Тестовый скрипт для демонстрации работы MCP сервера
 * Запуск: node scripts/test-mcp.js
 */

const http = require('http');

const MCP_SERVER_URL = 'http://localhost:3000/api/mcp';

// Функция для отправки MCP запросов
async function sendMcpRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Ошибка парсинга JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Ошибка запроса: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Тестовые функции
async function testToolsList() {
  console.log('🔍 Тестирование tools/list...');
  try {
    const response = await sendMcpRequest('tools/list');
    console.log('✅ Список инструментов получен:');
    response.result.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Ошибка получения списка инструментов:', error.message);
    return false;
  }
}

async function testToolCall(toolName, args) {
  console.log(`🔧 Тестирование вызова инструмента: ${toolName}...`);
  try {
    const response = await sendMcpRequest('tools/call', {
      name: toolName,
      arguments: args
    });
    console.log('✅ Инструмент вызван успешно:');
    console.log('Ответ:', response.result.content[0].text);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка вызова инструмента ${toolName}:`, error.message);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестов MCP сервера...\n');

  // Проверяем доступность сервера
  try {
    await sendMcpRequest('tools/list');
    console.log('✅ MCP сервер доступен\n');
  } catch (error) {
    console.error('❌ MCP сервер недоступен:', error.message);
    console.log('\n💡 Убедитесь, что сервер запущен: pnpm dev');
    process.exit(1);
  }

  // Тест 1: Получение списка инструментов
  const toolsListSuccess = await testToolsList();
  console.log('');

  if (!toolsListSuccess) {
    console.log('❌ Тесты прерваны из-за ошибки получения списка инструментов');
    process.exit(1);
  }

  // Тест 2: Вызов инструмента генерации изображения
  await testToolCall('generate_image', {
    prompt: 'Красивый закат над океаном',
    model: 'dall-e-3',
    resolution: '1024x1024'
  });
  console.log('');

  // Тест 3: Вызов инструмента улучшения промпта
  await testToolCall('enhance_prompt', {
    originalPrompt: 'создай картинку кота',
    mediaType: 'image',
    enhancementLevel: 'detailed'
  });
  console.log('');

  // Тест 4: Вызов инструмента генерации скрипта
  await testToolCall('generate_script', {
    prompt: 'Создай скрипт для видео о приготовлении пиццы',
    scriptType: 'video',
    length: 'medium'
  });
  console.log('');

  console.log('🎉 Все тесты завершены!');
  console.log('\n📖 Для использования MCP в AI клиентах см. docs/mcp-usage-guide.md');
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Критическая ошибка:', error.message);
    process.exit(1);
  });
}

module.exports = { sendMcpRequest, testToolsList, testToolCall };

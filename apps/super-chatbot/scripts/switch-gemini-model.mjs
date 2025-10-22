#!/usr/bin/env node

/**
 * Утилита для быстрого переключения между моделями Gemini
 *
 * Использование:
 *   node switch-gemini-model.mjs                    # Показать текущие модели
 *   node switch-gemini-model.mjs gemini-2.0-flash   # Переключить main модель
 *   node switch-gemini-model.mjs --list             # Показать доступные модели
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_FILE = join(__dirname, '.env.local');

// Популярные модели с описанием
const POPULAR_MODELS = {
  'gemini-2.5-flash': 'Стабильная, быстрая (июнь 2025) - рекомендуется',
  'gemini-2.5-flash-lite': 'Облегченная версия 2.5',
  'gemini-2.5-pro': 'Pro версия 2.5 - для сложных задач',
  'gemini-2.0-flash': 'Flash 2.0',
  'gemini-2.0-flash-001': 'Стабильная версия 2.0',
  'gemini-2.0-flash-lite': 'Облегченная версия 2.0',
  'gemini-flash-latest': 'Всегда последняя Flash (может меняться)',
  'gemini-pro-latest': 'Всегда последняя Pro (может меняться)',
};

function readEnvFile() {
  if (!existsSync(ENV_FILE)) {
    console.error('❌ Файл .env.local не найден');
    console.log('💡 Создайте .env.local на основе .env.local.example');
    process.exit(1);
  }
  return readFileSync(ENV_FILE, 'utf-8');
}

function writeEnvFile(content) {
  writeFileSync(ENV_FILE, content, 'utf-8');
}

function getCurrentModels(envContent) {
  const mainMatch = envContent.match(/GEMINI_MAIN_MODEL=(.+)/);
  const proMatch = envContent.match(/GEMINI_PRO_MODEL=(.+)/);
  const flashMatch = envContent.match(/GEMINI_FLASH_MODEL=(.+)/);

  return {
    main: mainMatch ? mainMatch[1].trim() : 'gemini-2.5-flash (default)',
    pro: proMatch ? proMatch[1].trim() : 'gemini-2.5-pro (default)',
    flash: flashMatch ? flashMatch[1].trim() : 'gemini-2.5-flash (default)',
  };
}

function updateMainModel(envContent, newModel) {
  const mainRegex = /GEMINI_MAIN_MODEL=.+/;

  if (mainRegex.test(envContent)) {
    // Обновляем существующую строку
    return envContent.replace(mainRegex, `GEMINI_MAIN_MODEL=${newModel}`);
  } else {
    // Добавляем новую строку после GOOGLE_AI_API_KEY
    const lines = envContent.split('\n');
    const apiKeyIndex = lines.findIndex(line => line.startsWith('GOOGLE_AI_API_KEY='));

    if (apiKeyIndex === -1) {
      // Добавляем в конец файла
      return envContent + `\n\n# Gemini Model Configuration\nGEMINI_MAIN_MODEL=${newModel}\n`;
    }

    // Вставляем после GOOGLE_AI_API_KEY
    lines.splice(apiKeyIndex + 1, 0, `GEMINI_MAIN_MODEL=${newModel}`);
    return lines.join('\n');
  }
}

function showCurrentConfig() {
  const envContent = readEnvFile();
  const models = getCurrentModels(envContent);

  console.log('\n📊 Текущая конфигурация моделей Gemini:\n');
  console.log(`   Main:  ${models.main}`);
  console.log(`   Pro:   ${models.pro}`);
  console.log(`   Flash: ${models.flash}`);
  console.log('\n💡 Для изменения используйте: node switch-gemini-model.mjs <model-name>');
  console.log('💡 Для списка моделей: node switch-gemini-model.mjs --list\n');
}

function listModels() {
  console.log('\n🤖 Популярные модели Gemini:\n');

  for (const [model, description] of Object.entries(POPULAR_MODELS)) {
    console.log(`   ${model.padEnd(30)} - ${description}`);
  }

  console.log('\n💡 Для полного списка запустите: node list-gemini-models.mjs');
  console.log('💡 Для переключения: node switch-gemini-model.mjs <model-name>\n');
}

function switchModel(newModel) {
  const envContent = readEnvFile();
  const updatedContent = updateMainModel(envContent, newModel);

  writeEnvFile(updatedContent);

  console.log(`\n✅ Main модель изменена на: ${newModel}`);
  console.log('🔄 Перезапустите dev сервер для применения изменений\n');

  // Показываем новую конфигурацию
  showCurrentConfig();
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);

if (args.length === 0) {
  // Показать текущую конфигурацию
  showCurrentConfig();
} else if (args[0] === '--list' || args[0] === '-l') {
  // Показать список моделей
  listModels();
} else {
  // Переключить модель
  const newModel = args[0];
  switchModel(newModel);
}

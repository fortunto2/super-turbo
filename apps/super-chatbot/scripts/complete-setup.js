#!/usr/bin/env node

/**
 * Complete setup script - shows all steps needed
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function showCompleteSetup() {
  console.log('🎯 ПОЛНАЯ НАСТРОЙКА API С ОБРАБОТКОЙ ОШИБОК PREFECT');
  console.log('==================================================');
  console.log('');

  console.log('✅ ВЫПОЛНЕНО:');
  console.log('- API логика восстановлена с обработкой ошибок');
  console.log('- Добавлены функции для работы с проектами');
  console.log('- Создана система отката транзакций');
  console.log('- Исправлены все ошибки линтера');
  console.log('');

  console.log('⏳ НУЖНО СДЕЛАТЬ:');
  console.log('');

  console.log('1️⃣ ПРИМЕНИТЬ МИГРАЦИЮ БАЗЫ ДАННЫХ:');
  console.log('   Выполните эти SQL команды в PostgreSQL:');
  console.log('');

  try {
    const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
  } catch (error) {
    console.log('   (Ошибка чтения файла миграции)');
  }

  console.log('');
  console.log('2️⃣ ЗАПУСТИТЬ СЕРВЕР:');
  console.log('   npm run dev');
  console.log('');

  console.log('3️⃣ ПРОТЕСТИРОВАТЬ API:');
  console.log('   POST http://localhost:3000/api/story-editor/generate');
  console.log('   С телом запроса:');
  console.log('   {');
  console.log('     "template_name": "story",');
  console.log('     "config": {');
  console.log('       "prompt": "Test prompt",');
  console.log('       "aspect_ratio": "16:9",');
  console.log('       "image_generation_config_name": "test-config",');
  console.log('       "auto_mode": true,');
  console.log('       "seed": 123,');
  console.log('       "quality": "hd",');
  console.log('       "entity_ids": []');
  console.log('     }');
  console.log('   }');
  console.log('');

  console.log('4️⃣ ПРОВЕРИТЬ БАЗУ ДАННЫХ:');
  console.log('   SELECT "projectId", "status", "creditsUsed", "errorMessage"');
  console.log('   FROM "UserProject" ORDER BY "createdAt" DESC LIMIT 5;');
  console.log('');

  console.log('🎉 РЕЗУЛЬТАТ:');
  console.log('- Проекты создаются с правильным статусом');
  console.log('- Баланс списывается только после успешного создания');
  console.log('- Ошибки Prefect обрабатываются с возвратом кредитов');
  console.log('- Статус проектов отслеживается в реальном времени');
  console.log('');

  console.log('📁 ФАЙЛЫ ДЛЯ СПРАВКИ:');
  console.log('- MIGRATION_APPLY_NOW.md - инструкции по миграции');
  console.log('- API_RESTORATION_SUMMARY.md - резюме изменений');
  console.log('- src/app/api/story-editor/generate/route.ts - основной API');
  console.log('');

  console.log('🚀 ВСЕ ГОТОВО! Примените миграцию и тестируйте!');
}

showCompleteSetup();







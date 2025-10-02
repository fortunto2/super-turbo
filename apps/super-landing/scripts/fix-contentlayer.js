#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

/**
 * Скрипт для исправления проблемы с ContentLayer
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление проблемы с ContentLayer...\n');

const contentDir = path.join(__dirname, '..', 'src', 'content');
const generatedDir = path.join(__dirname, '..', '.contentlayer', 'generated');

// Проверяем существование директорий
console.log('📁 Проверка директорий:');

if (!fs.existsSync(contentDir)) {
  console.log('❌ Директория content не найдена:', contentDir);
  process.exit(1);
} else {
  console.log('✅ Директория content найдена');
}

// Создаем .contentlayer директорию если её нет
if (!fs.existsSync(path.dirname(generatedDir))) {
  console.log('📁 Создание .contentlayer директории...');
  fs.mkdirSync(path.dirname(generatedDir), { recursive: true });
}

if (!fs.existsSync(generatedDir)) {
  console.log('📁 Создание .contentlayer/generated директории...');
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Проверяем файлы блога
const blogDir = path.join(contentDir, 'blog');
if (fs.existsSync(blogDir)) {
  console.log('✅ Директория blog найдена');
  
  // Проверяем языковые директории
  const locales = ['en', 'ru', 'es', 'hi', 'tr'];
  locales.forEach(locale => {
    const localeDir = path.join(blogDir, locale);
    if (fs.existsSync(localeDir)) {
      const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.mdx'));
      console.log(`   ${locale}: ${files.length} файлов`);
    }
  });
} else {
  console.log('❌ Директория blog не найдена');
}

// Создаем пустой индексный файл если его нет
const blogIndexPath = path.join(generatedDir, 'Blog', '_index.json');
const blogIndexDir = path.dirname(blogIndexPath);

if (!fs.existsSync(blogIndexDir)) {
  console.log('📁 Создание директории Blog...');
  fs.mkdirSync(blogIndexDir, { recursive: true });
}

if (!fs.existsSync(blogIndexPath)) {
  console.log('📄 Создание пустого _index.json...');
  fs.writeFileSync(blogIndexPath, JSON.stringify([], null, 2));
  console.log('✅ _index.json создан');
} else {
  console.log('✅ _index.json уже существует');
}

console.log('\n🎯 Рекомендации:');
console.log('1. Убедитесь, что contentlayer2 правильно установлен');
console.log('2. Проверьте, что все MDX файлы имеют правильную структуру');
console.log('3. Попробуйте очистить кэш: pnpm clean-cache');
console.log('4. Пересоберите проект: pnpm build');

console.log('\n🚀 Команды для исправления:');
console.log('cd apps/super-landing');
console.log('pnpm clean-cache');
console.log('pnpm build'); 
#!/usr/bin/env node

/**
 * Кроссплатформенный скрипт для очистки папок
 * Работает на Windows, macOS и Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Папка ${dirPath} не существует, пропускаем`);
    return;
  }
  
  try {
    console.log(`🗑️  Удаляем папку: ${dirPath}`);
    
    if (os.platform() === 'win32') {
      execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
    }
    
    console.log(`✅ Папка ${dirPath} успешно удалена`);
  } catch (error) {
    console.error(`❌ Ошибка при удалении папки ${dirPath}:`, error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Использование: node scripts/clean.js <путь1> [путь2] ...');
    console.log('Примеры:');
    console.log('  node scripts/clean.js node_modules');
    console.log('  node scripts/clean.js dist .next');
    console.log('  node scripts/clean.js packages/*/node_modules');
    process.exit(1);
  }
  
  console.log('🧹 Начинаем очистку...\n');
  
  args.forEach(arg => {
    // Обрабатываем glob паттерны
    if (arg.includes('*')) {
      const glob = require('glob');
      const matches = glob.sync(arg);
      if (matches.length === 0) {
        console.log(`📁 Паттерн ${arg} не найден, пропускаем`);
        return;
      }
      matches.forEach(match => {
        const fullPath = path.resolve(match);
        removeDirectory(fullPath);
      });
    } else {
      const fullPath = path.resolve(arg);
      removeDirectory(fullPath);
    }
  });
  
  console.log('\n🎉 Очистка завершена!');
}

main();

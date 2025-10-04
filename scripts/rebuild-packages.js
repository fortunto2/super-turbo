#!/usr/bin/env node

/**
 * Скрипт для пересборки всех пакетов в правильном порядке
 * Решает проблемы с зависимостями workspace пакетов в CI/CD
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Пересборка всех пакетов в правильном порядке...\n');

// Определяем порядок сборки пакетов (от базовых к зависимым)
const packageOrder = [
  'packages/shared',
  'packages/tailwind',
  'packages/ui', 
  'packages/core',
  'packages/api',
  'packages/features',
  'packages/payment'
];

// Функция для проверки существования пакета
function packageExists(packagePath) {
  return fs.existsSync(packagePath) && fs.existsSync(path.join(packagePath, 'package.json'));
}

// Кроссплатформенная функция для удаления папки
function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  try {
    if (os.platform() === 'win32') {
      execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.warn(`⚠️ Не удалось удалить папку ${dirPath}:`, error.message);
  }
}

// Функция для очистки и пересборки пакета
function rebuildPackage(packagePath) {
  const packageName = path.basename(packagePath);
  console.log(`📦 Пересборка ${packageName}...`);
  
  try {
    // Очищаем dist папку
    const distPath = path.join(packagePath, 'dist');
    removeDirectory(distPath);
    
    // Устанавливаем зависимости
    execSync('pnpm install', { cwd: packagePath, stdio: 'inherit' });
    
    // Собираем пакет
    execSync('pnpm run build', { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`✅ ${packageName} успешно пересобран\n`);
  } catch (error) {
    console.error(`❌ Ошибка при пересборке ${packageName}:`, error.message);
    process.exit(1);
  }
}

// Основная логика
async function main() {
  console.log('🔍 Проверка пакетов...\n');
  
  // Проверяем существование пакетов
  const existingPackages = packageOrder.filter(packageExists);
  
  if (existingPackages.length === 0) {
    console.log('⚠️ Не найдено ни одного пакета для сборки');
    return;
  }
  
  console.log(`📋 Найдено пакетов: ${existingPackages.length}\n`);
  
  // Пересобираем пакеты в правильном порядке
  for (const packagePath of existingPackages) {
    rebuildPackage(packagePath);
  }
  
  console.log('🎉 Все пакеты успешно пересобраны!');
  console.log('\n📝 Рекомендации:');
  console.log('1. Зафиксируйте изменения в git');
  console.log('2. Убедитесь, что все workspace зависимости корректно ссылаются на собранные пакеты');
  console.log('3. При необходимости обновите .gitignore для исключения dist/ папок');
}

// Запускаем скрипт
main().catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});

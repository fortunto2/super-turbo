#!/usr/bin/env node

/**
 * Скрипт для проверки сборки чатбота
 * Проверяет основные зависимости и конфигурацию
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка конфигурации чатбота...\n');

// Проверяем package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('✅ package.json найден');
  console.log(`   Node.js версия: ${packageJson.engines?.node || 'не указана'}`);
  console.log(`   Build скрипт: ${packageJson.scripts?.build || 'не найден'}`);
  
  // Проверяем workspace зависимости
  const workspaceDeps = Object.keys(packageJson.dependencies || {}).filter(dep => dep.startsWith('@turbo-super/'));
  console.log(`   Workspace зависимости: ${workspaceDeps.length} пакетов`);
} else {
  console.log('❌ package.json не найден');
}

// Проверяем next.config.ts
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.ts найден');
} else {
  console.log('❌ next.config.ts не найден');
}

// Проверяем vercel.json
const vercelConfigPath = path.join(__dirname, '..', 've1rcel.json');
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  console.log('✅ vercel.json найден');
  console.log(`   Build команда: ${vercelConfig.buildCommand || 'не указана'}`);
  console.log(`   Install команда: ${vercelConfig.installCommand || 'не указана'}`);
} else {
  console.log('❌ vercel.json не найден');
}

console.log('\n🎯 Рекомендации для Vercel:');
console.log('1. Убедитесь, что в Vercel установлена Node.js версия >=20.18.1');
console.log('2. Проверьте, что все workspace пакеты собраны перед сборкой чатбота');
console.log('3. Убедитесь, что все необходимые environment variables настроены');
console.log('4. Проверьте, что команды build и install работают локально');

console.log('\n✨ Проверка завершена!');

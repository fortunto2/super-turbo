#!/usr/bin/env node

/**
 * Скрипт для диагностики проблем с middleware в турборепозитории
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Диагностика проблем с middleware в турборепозитории...\n');

// Проверяем структуру проекта
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..', '..');

console.log('📁 Структура проекта:');
console.log(`   Проект: ${projectRoot}`);
console.log(`   Workspace: ${workspaceRoot}\n`);

// Проверяем наличие middleware
const middlewarePath = path.join(projectRoot, 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('✅ Middleware найден');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Проверяем наличие проблемных паттернов
  const hasMatcher = middlewareContent.includes('export const config');
  const hasEdgeRuntime = middlewareContent.includes('runtime: "edge"');
  const hasComplexLogic = middlewareContent.includes('try {') && middlewareContent.includes('} catch');
  
  console.log(`   Matcher: ${hasMatcher ? '❌ Найден' : '✅ Отсутствует'}`);
  console.log(`   Edge Runtime: ${hasEdgeRuntime ? '❌ Найден' : '✅ Отсутствует'}`);
  console.log(`   Сложная логика: ${hasComplexLogic ? '❌ Найдена' : '✅ Отсутствует'}`);
} else {
  console.log('❌ Middleware не найден');
}

// Проверяем next.config
const nextConfigPath = path.join(projectRoot, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  console.log('\n✅ Next.js конфигурация найдена');
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  const hasExperimental = configContent.includes('experimental:');
  const hasTurbo = configContent.includes('turbo:');
  const hasSentry = configContent.includes('withSentryConfig');
  
  console.log(`   Experimental: ${hasExperimental ? '✅ Найдено' : '❌ Отсутствует'}`);
  console.log(`   Turbo: ${hasTurbo ? '✅ Найдено' : '❌ Отсутствует'}`);
  console.log(`   Sentry: ${hasSentry ? '❌ Найден' : '✅ Отсутствует'}`);
} else {
  console.log('\n❌ Next.js конфигурация не найдена');
}

// Проверяем package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\n✅ Package.json найден');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const nextVersion = packageJson.dependencies?.next;
  const reactVersion = packageJson.dependencies?.react;
  const hasWorkspaceDeps = Object.keys(packageJson.dependencies || {}).some(dep => dep.startsWith('@turbo-super/'));
  
  console.log(`   Next.js версия: ${nextVersion || '❌ Не найдена'}`);
  console.log(`   React версия: ${reactVersion || '❌ Не найдена'}`);
  console.log(`   Workspace зависимости: ${hasWorkspaceDeps ? '✅ Найдены' : '❌ Отсутствуют'}`);
} else {
  console.log('\n❌ Package.json не найден');
}

// Проверяем turbo.json
const turboJsonPath = path.join(workspaceRoot, 'turbo.json');
if (fs.existsSync(turboJsonPath)) {
  console.log('\n✅ Turbo.json найден');
  const turboJson = JSON.parse(fs.readFileSync(turboJsonPath, 'utf8'));
  
  const hasBuildTask = turboJson.tasks?.build;
  const hasGlobalEnv = turboJson.globalEnv;
  
  console.log(`   Build task: ${hasBuildTask ? '✅ Найден' : '❌ Отсутствует'}`);
  console.log(`   Global env: ${hasGlobalEnv ? '✅ Найдены' : '❌ Отсутствуют'}`);
} else {
  console.log('\n❌ Turbo.json не найден');
}

console.log('\n🎯 Рекомендации:');
console.log('1. Убедитесь, что middleware не использует Edge Runtime');
console.log('2. Проверьте, что matcher не конфликтует с турборепозиторием');
console.log('3. Отключите Sentry в middleware для диагностики');
console.log('4. Проверьте версии Next.js и React на совместимость');
console.log('5. Убедитесь, что workspace зависимости правильно разрешены');

console.log('\n🚀 Для тестирования выполните:');
console.log('   pnpm build');
console.log('   pnpm start'); 
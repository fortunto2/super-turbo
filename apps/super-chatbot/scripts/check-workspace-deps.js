#!/usr/bin/env node

/**
 * Скрипт для проверки workspace зависимостей в турборепозитории
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🔍 Проверка workspace зависимостей...\n');

const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..', '..');

// Проверяем package.json проекта
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Зависимости проекта:');
const workspaceDeps = Object.keys(packageJson.dependencies || {}).filter(dep => dep.startsWith('@turbo-super/'));
const workspaceDevDeps = Object.keys(packageJson.devDependencies || {}).filter(dep => dep.startsWith('@turbo-super/'));

console.log('   Workspace зависимости:', workspaceDeps);
console.log('   Workspace dev зависимости:', workspaceDevDeps);

// Проверяем наличие пакетов
console.log('\n📁 Проверка наличия пакетов:');
const packagesDir = path.join(workspaceRoot, 'packages');

if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log('   Найденные пакеты:', packages);
  
  // Проверяем каждый workspace пакет
  for (const dep of [...workspaceDeps, ...workspaceDevDeps]) {
    const packageName = dep.replace('@turbo-super/', '');
    const packagePath = path.join(packagesDir, packageName);
    
    if (fs.existsSync(packagePath)) {
      const packageJsonPath = path.join(packagePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log(`   ✅ ${dep}: ${pkgJson.version}`);
      } else {
        console.log(`   ❌ ${dep}: package.json не найден`);
      }
    } else {
      console.log(`   ❌ ${dep}: пакет не найден`);
    }
  }
} else {
  console.log('   ❌ Директория packages не найдена');
}

// Проверяем node_modules
console.log('\n📂 Проверка node_modules:');
const nodeModulesPath = path.join(projectRoot, 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  for (const dep of [...workspaceDeps, ...workspaceDevDeps]) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep}: найден в node_modules`);
    } else {
      console.log(`   ❌ ${dep}: не найден в node_modules`);
    }
  }
} else {
  console.log('   ❌ node_modules не найден');
}

// Проверяем pnpm-workspace.yaml
console.log('\n📋 Проверка workspace конфигурации:');
const workspaceYamlPath = path.join(workspaceRoot, 'pnpm-workspace.yaml');
if (fs.existsSync(workspaceYamlPath)) {
  console.log('   ✅ pnpm-workspace.yaml найден');
  const workspaceYaml = fs.readFileSync(workspaceYamlPath, 'utf8');
  console.log('   Содержимое:', workspaceYaml.trim());
} else {
  console.log('   ❌ pnpm-workspace.yaml не найден');
}

console.log('\n🎯 Рекомендации:');
console.log('1. Убедитесь, что все workspace пакеты правильно настроены');
console.log('2. Выполните pnpm install в корне workspace');
console.log('3. Проверьте, что pnpm-workspace.yaml содержит правильные пути');
console.log('4. Убедитесь, что версии пакетов совместимы');

console.log('\n🚀 Команды для исправления:');
console.log('   cd ../../');
console.log('   pnpm install');
console.log('   pnpm build'); 
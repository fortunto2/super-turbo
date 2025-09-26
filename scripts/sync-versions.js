#!/usr/bin/env node

/**
 * Скрипт для синхронизации версий зависимостей во всех пакетах
 * Обеспечивает консистентность версий в турборепозитории
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Версии для синхронизации
const VERSIONS = {
  typescript: "^5.6.3",
  next: "15.3.1",
  react: "^19.1.0",
  "react-dom": "^19.1.0",
  ai: "^4.3.16",
  "@ai-sdk/azure": "^1.3.23",
  "@ai-sdk/react": "^1.2.12",
  zod: "^3.25.67",
  tailwindcss: "^3.4.0",
  eslint: "^9.24.0",
  tsup: "^8.0.2"
};

// Пакеты для обновления версий
const PACKAGE_VERSIONS = {
  "@turbo-super/shared": "1.0.0",
  "@turbo-super/ui": "1.0.0", 
  "@turbo-super/core": "1.0.0",
  "@turbo-super/api": "1.0.0",
  "@turbo-super/features": "1.0.0",
  "@turbo-super/payment": "1.0.0",
  "@turbo-super/tailwind": "1.0.0",
  "@turbo-super/eslint-config": "1.0.0"
};

console.log('🔄 Синхронизация версий зависимостей...\n');

function updatePackageJson(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;

  // Обновляем версию пакета
  if (PACKAGE_VERSIONS[packageJson.name]) {
    packageJson.version = PACKAGE_VERSIONS[packageJson.name];
    updated = true;
  }

  // Обновляем зависимости
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(VERSIONS).forEach(depName => {
        if (packageJson[depType][depName]) {
          packageJson[depType][depName] = VERSIONS[depName];
          updated = true;
        }
      });
    }
  });

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Обновлен ${packageJson.name}`);
  }
}

function main() {
  // Обновляем все пакеты
  const packagesDir = path.join(__dirname, '..', 'packages');
  const appsDir = path.join(__dirname, '..', 'apps');

  // Обновляем пакеты
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir);
    packages.forEach(pkg => {
      updatePackageJson(path.join(packagesDir, pkg));
    });
  }

  // Обновляем приложения
  if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir);
    apps.forEach(app => {
      updatePackageJson(path.join(appsDir, app));
    });
  }

  console.log('\n🎉 Синхронизация версий завершена!');
  console.log('\n📝 Следующие шаги:');
  console.log('1. Запустите: pnpm install');
  console.log('2. Запустите: pnpm run build:packages');
  console.log('3. Проверьте, что все тесты проходят');
}

main();

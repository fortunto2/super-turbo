#!/usr/bin/env node

/**
 * Скрипт для проверки консистентности версий зависимостей
 * Помогает выявить несоответствия в версиях между пакетами
 */

const fs = require('fs');
const path = require('path');

// Ожидаемые версии
const EXPECTED_VERSIONS = {
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

console.log('🔍 Проверка консистентности версий...\n');

const issues = [];
const packageVersions = new Map();

function checkPackage(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageName = packageJson.name;
  
  if (!packageName) return;

  // Проверяем версии зависимостей
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(EXPECTED_VERSIONS).forEach(depName => {
        const actualVersion = packageJson[depType][depName];
        const expectedVersion = EXPECTED_VERSIONS[depName];
        
        if (actualVersion) {
          // Сохраняем версию для сравнения
          if (!packageVersions.has(depName)) {
            packageVersions.set(depName, new Map());
          }
          packageVersions.get(depName).set(packageName, actualVersion);
          
          // Проверяем соответствие ожидаемой версии
          if (actualVersion !== expectedVersion) {
            issues.push({
              type: 'version_mismatch',
              package: packageName,
              dependency: depName,
              actual: actualVersion,
              expected: expectedVersion,
              depType
            });
          }
        }
      });
    }
  });
}

function main() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const appsDir = path.join(__dirname, '..', 'apps');

  // Проверяем пакеты
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir);
    packages.forEach(pkg => {
      checkPackage(path.join(packagesDir, pkg));
    });
  }

  // Проверяем приложения
  if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir);
    apps.forEach(app => {
      checkPackage(path.join(appsDir, app));
    });
  }

  // Выводим результаты
  if (issues.length === 0) {
    console.log('✅ Все версии зависимостей консистентны!');
  } else {
    console.log(`❌ Найдено ${issues.length} проблем с версиями:\n`);
    
    issues.forEach(issue => {
      console.log(`📦 ${issue.package}`);
      console.log(`   ${issue.dependency}: ${issue.actual} (ожидается: ${issue.expected})`);
      console.log(`   Тип: ${issue.depType}\n`);
    });
    
    console.log('💡 Для исправления запустите: pnpm run sync-versions');
  }

  // Проверяем консистентность между пакетами
  console.log('\n🔍 Проверка консистентности между пакетами...');
  
  let hasInconsistencies = false;
  packageVersions.forEach((versions, depName) => {
    const uniqueVersions = new Set(versions.values());
    if (uniqueVersions.size > 1) {
      hasInconsistencies = true;
      console.log(`\n⚠️  ${depName} имеет разные версии:`);
      versions.forEach((version, packageName) => {
        console.log(`   ${packageName}: ${version}`);
      });
    }
  });

  if (!hasInconsistencies) {
    console.log('✅ Все пакеты используют одинаковые версии зависимостей');
  }

  // Завершаем с кодом ошибки если есть проблемы
  if (issues.length > 0 || hasInconsistencies) {
    process.exit(1);
  }
}

main();

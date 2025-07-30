#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Функция для исправления импорта React в файле
function fixReactImport(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Паттерн для поиска импорта React с именованными экспортами
    const reactImportPattern = /import React, ({[^}]+}) from ['"]react['"];?/g;
    
    content = content.replace(reactImportPattern, (match, namedImports) => {
      modified = true;
      return `import { ${namedImports} } from 'react';`;
    });

    // Паттерн для поиска только импорта React без именованных экспортов
    const reactOnlyPattern = /import React from ['"]react['"];?/g;
    
    content = content.replace(reactOnlyPattern, (match) => {
      modified = true;
      return '';
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Исправлен: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🔧 Исправление импортов React...\n');

  // Поиск всех TypeScript/TSX файлов
  const patterns = [
    'apps/**/*.tsx',
    'apps/**/*.ts',
    'packages/**/*.tsx',
    'packages/**/*.ts'
  ];

  let totalFiles = 0;
  let fixedFiles = 0;

  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] });
    
    files.forEach(file => {
      totalFiles++;
      if (fixReactImport(file)) {
        fixedFiles++;
      }
    });
  });

  console.log(`\n📊 Результат:`);
  console.log(`   Всего файлов проверено: ${totalFiles}`);
  console.log(`   Файлов исправлено: ${fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n✅ Импорты React успешно исправлены!');
  } else {
    console.log('\nℹ️  Все импорты React уже корректны.');
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { fixReactImport }; 
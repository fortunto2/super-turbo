#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Файлы для обновления
const FILES_TO_UPDATE = [
  {
    file: 'apps/super-landing/src/app/globals.css',
    theme: 'landing'
  },
  {
    file: 'apps/super-chatbot/src/app/globals.css', 
    theme: 'chatbot'
  }
];

// Импорт для добавления
const PROJECT_CSS_IMPORT = '@import "@turbo-super/ui/src/project-themes.css";\n\n';

function addProjectThemes(filePath, themeName) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем, есть ли уже импорт проектных тем
    if (content.includes('@turbo-super/ui/src/project-themes.css')) {
      console.log(`✅ CSS импорт тем уже есть в: ${filePath}`);
      return false;
    }

    // Добавляем импорт в начало файла
    let newContent = PROJECT_CSS_IMPORT + content;
    
    // Добавляем класс темы к body, если его еще нет
    const bodyClassRegex = /body\s*{([^}]*)}/;
    const themeClass = `theme-${themeName}`;
    
    if (bodyClassRegex.test(newContent)) {
      // Если есть стили для body, добавляем класс
      if (!newContent.includes(themeClass)) {
        // Ищем первый селектор body и добавляем класс
        const firstBodyMatch = newContent.match(/(\s*)body\s*{/);
        if (firstBodyMatch) {
          const indent = firstBodyMatch[1];
          const bodyComment = `${indent}/* Применяем тему проекта */\n${indent}body {\n${indent}  @apply ${themeClass};\n${indent}}\n\n`;
          
          // Находим место после последнего импорта
          const lastImportMatch = newContent.match(/@import[^;]*;(\s*)/g);
          if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            const insertPos = newContent.indexOf(lastImport) + lastImport.length;
            newContent = newContent.slice(0, insertPos) + bodyComment + newContent.slice(insertPos);
          }
        }
      }
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Добавлен импорт проектных тем в: ${filePath}`);
    console.log(`🎨 Применена тема: ${themeClass}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Ошибка при обновлении ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 Добавление проектных тем...\n');
  
  let updatedCount = 0;
  
  for (const { file, theme } of FILES_TO_UPDATE) {
    if (addProjectThemes(file, theme)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Результат: обновлено ${updatedCount} файлов`);
  
  if (updatedCount > 0) {
    console.log('\n💡 Теперь перезапустите приложения для применения тем');
    console.log('🎯 Каждое приложение будет использовать свою тему!');
  }
}

main();
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Файлы, в которые нужно удалить импорт CSS
const FILES_TO_UPDATE = [
  'apps/super-landing/src/app/globals.css',
  'apps/super-chatbot/src/app/globals.css'
];

function removeUICssImport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем, есть ли импорт UI CSS
    if (!content.includes('@turbo-super/ui/src/ui.css')) {
      console.log(`✅ CSS импорт уже удален из: ${filePath}`);
      return false;
    }

    // Удаляем импорт
    const newContent = content.replace(/@import "@turbo-super\/ui\/src\/ui\.css";\n\n?/g, '');
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Удален CSS импорт из: ${filePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Ошибка при обновлении ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 Удаление CSS импортов UI компонентов...\n');
  
  let updatedCount = 0;
  
  for (const filePath of FILES_TO_UPDATE) {
    if (removeUICssImport(filePath)) {
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Результат: обновлено ${updatedCount} файлов`);
  
  if (updatedCount > 0) {
    console.log('\n💡 Теперь перезапустите приложения для применения изменений');
    console.log('🎯 Каждое приложение будет использовать свои собственные цвета!');
  }
}

main(); 
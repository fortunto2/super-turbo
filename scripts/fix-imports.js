#!/usr/bin/env node

/**
 * Скрипт для исправления импортов после миграции на общие пакеты
 */

const fs = require('fs');
const path = require('path');

// Маппинг старых путей на новые пакеты
const IMPORT_MAPPING = {
  // UI компоненты - абсолютные пути
  '@/components/ui/button': '@turbo-super/ui',
  '@/components/ui/card': '@turbo-super/ui',
  '@/components/ui/input': '@turbo-super/ui',
  '@/components/ui/badge': '@turbo-super/ui',
  '@/components/ui/tabs': '@turbo-super/ui',
  '@/components/ui/textarea': '@turbo-super/ui',
  '@/components/ui/label': '@turbo-super/ui',
  '@/components/ui/separator': '@turbo-super/ui',
  '@/components/ui/skeleton': '@turbo-super/ui',
  '@/components/ui/dialog': '@turbo-super/ui',
  
  // UI компоненты - относительные пути
  './ui/button': '@turbo-super/ui',
  './ui/card': '@turbo-super/ui',
  './ui/input': '@turbo-super/ui',
  './ui/badge': '@turbo-super/ui',
  './ui/tabs': '@turbo-super/ui',
  './ui/textarea': '@turbo-super/ui',
  './ui/label': '@turbo-super/ui',
  './ui/separator': '@turbo-super/ui',
  './ui/skeleton': '@turbo-super/ui',
  './ui/dialog': '@turbo-super/ui',
  
  // Утилиты и хуки
  '@/lib/utils': '@turbo-super/ui',
  '@/lib/format': '@turbo-super/shared',
  '@/lib/validation': '@turbo-super/shared',
  '@/hooks/use-debounce': '@turbo-super/shared',
  '@/hooks/use-local-storage': '@turbo-super/shared',
  '@/hooks/use-media-query': '@turbo-super/shared',
  '@/hooks/use-click-outside': '@turbo-super/shared',
  
  // Типы и константы
  '@/types/artifact-types': '@turbo-super/data',
  '@/types/websocket-types': '@turbo-super/data',
  '@/lib/constants': '@turbo-super/data',
};

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath, callback);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
      callback(filePath);
    }
  }
}

function fixImports(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // Собираем все импорты для каждого пакета
  const packageImports = {};
  
  // Находим все импорты с деструктуризацией
  for (const [oldPath, newPackage] of Object.entries(IMPORT_MAPPING)) {
    const destructureRegex = new RegExp(`import\\s*{([^}]+)}\\s+from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`, 'g');
    
    let match;
    while ((match = destructureRegex.exec(newContent)) !== null) {
      if (!packageImports[newPackage]) {
        packageImports[newPackage] = new Set();
      }
      
      // Разбираем импорты и добавляем их в набор
      const imports = match[1].split(',').map(imp => imp.trim());
      imports.forEach(imp => {
        if (imp) {
          packageImports[newPackage].add(imp);
        }
      });
      
      modified = true;
    }
  }
  
  // Удаляем старые импорты
  for (const [oldPath] of Object.entries(IMPORT_MAPPING)) {
    const destructureRegex = new RegExp(`import\\s*{[^}]*}\\s+from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?\\s*`, 'g');
    newContent = newContent.replace(destructureRegex, '');
  }
  
  // Добавляем новые группированные импорты
  const importStatements = [];
  for (const [packageName, imports] of Object.entries(packageImports)) {
    if (imports.size > 0) {
      const importList = Array.from(imports).join(', ');
      importStatements.push(`import { ${importList} } from '${packageName}';`);
    }
  }
  
  // Вставляем новые импорты в начало файла (после других импортов)
  if (importStatements.length > 0) {
    const importBlock = importStatements.join('\n');
    
    // Находим последний импорт в файле
    const lastImportRegex = /(import\s+[^;]+;?\s*)(?=\n(?!import))/g;
    const lastMatch = [...newContent.matchAll(lastImportRegex)].pop();
    
    if (lastMatch) {
      const insertPosition = lastMatch.index + lastMatch[0].length;
      newContent = newContent.slice(0, insertPosition) + '\n' + importBlock + newContent.slice(insertPosition);
    } else {
      // Если нет других импортов, добавляем в начало
      newContent = importBlock + '\n' + newContent;
    }
  }
  
  if (modified) {
    console.log(`  ✅ Исправлен: ${path.relative(process.cwd(), filePath)}`);
  }
  
  return newContent;
}

function main() {
  console.log('🔧 Исправляем импорты после миграции...\n');
  
  const apps = ['apps/super-landing', 'apps/super-chatbot'];
  let totalFixed = 0;
  
  for (const app of apps) {
    if (fs.existsSync(app)) {
      console.log(`📁 Обрабатываем: ${app}`);
      let appFixed = 0;
      
      walkDirectory(app, (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const newContent = fixImports(content, filePath);
          
          if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            appFixed++;
          }
        } catch (error) {
          console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
        }
      });
      
      console.log(`  📊 Исправлено файлов: ${appFixed}\n`);
      totalFixed += appFixed;
    }
  }
  
  console.log(`🎉 Миграция завершена! Всего исправлено файлов: ${totalFixed}`);
}

if (require.main === module) {
  main();
} 
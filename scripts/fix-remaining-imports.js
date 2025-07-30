#!/usr/bin/env node

/**
 * Скрипт для исправления оставшихся импортов после миграции
 */

const fs = require('fs');
const path = require('path');

// Маппинг оставшихся импортов
const REMAINING_IMPORTS = {
  // Компоненты, которые нужно оставить локальными (специфичные для приложений)
  '@/components/ui/optimized-link': 'LOCAL',
  '@/components/ui/analytics-providers': 'LOCAL',
  '@/components/ui/icons': 'LOCAL',
  '@/components/ui/safe-icon': 'LOCAL',
  '@/components/ui/accordion': 'LOCAL',
  '@/components/ui/breadcrumbs': 'LOCAL',
  '@/components/ui/veo3-payment-buttons': 'LOCAL',
  '@/components/ui/code-block': 'LOCAL',
  '@/components/ui/logo': 'LOCAL',
  '@/components/ui/dropdown-menu': 'LOCAL',
  '@/components/ui/sidebar': 'LOCAL',
  '@/components/ui/tooltip': 'LOCAL',
  '@/components/ui/dialog': 'LOCAL',
  '@/components/ui/skeleton': 'LOCAL',
  '@/components/ui/table': 'LOCAL',
  '@/components/ui/image-uploader': 'LOCAL',
  '@/components/ui/switch': 'LOCAL',
  '@/components/ui/moodboard-uploader': 'LOCAL',
  '@/components/ui/select': 'LOCAL',
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

function fixRemainingImports(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // Проверяем, есть ли импорты, которые нужно исправить
  for (const [oldPath, action] of Object.entries(REMAINING_IMPORTS)) {
    const importRegex = new RegExp(`import\\s+([^;]+)\\s+from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`, 'g');
    const destructureRegex = new RegExp(`import\\s*{([^}]+)}\\s+from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`, 'g');
    
    if (importRegex.test(newContent) || destructureRegex.test(newContent)) {
      // Если компонент должен остаться локальным, проверяем его существование
      if (action === 'LOCAL') {
        const componentPath = path.join(process.cwd(), oldPath.replace('@/', '')) + '.tsx';
        if (!fs.existsSync(componentPath)) {
          console.log(`  ⚠️  Компонент не найден: ${oldPath} в ${path.relative(process.cwd(), filePath)}`);
        }
      }
    }
  }
  
  return newContent;
}

function main() {
  console.log('🔧 Проверяем оставшиеся импорты...\n');
  
  const apps = ['apps/super-landing', 'apps/super-chatbot'];
  let totalChecked = 0;
  
  for (const app of apps) {
    if (fs.existsSync(app)) {
      console.log(`📁 Проверяем: ${app}`);
      let appChecked = 0;
      
      walkDirectory(app, (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          fixRemainingImports(content, filePath);
          appChecked++;
        } catch (error) {
          console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
        }
      });
      
      console.log(`  📊 Проверено файлов: ${appChecked}\n`);
      totalChecked += appChecked;
    }
  }
  
  console.log(`🎉 Проверка завершена! Всего проверено файлов: ${totalChecked}`);
  console.log('\n📋 Рекомендации:');
  console.log('1. Компоненты с пометкой "LOCAL" должны остаться в локальных папках приложений');
  console.log('2. Если компонент не найден, его нужно создать или удалить импорт');
  console.log('3. Проверьте, что все импорты из @turbo-super/ui, @turbo-super/shared, @turbo-super/data работают корректно');
}

if (require.main === module) {
  main();
} 
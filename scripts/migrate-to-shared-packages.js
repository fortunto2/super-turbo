#!/usr/bin/env node

/**
 * Скрипт для миграции приложений на использование общих пакетов
 * Заменяет локальные импорты на импорты из @turbo-super/ui и @turbo-super/shared
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Конфигурация миграции
const MIGRATION_CONFIG = {
  // Компоненты для миграции из @turbo-super/ui
  uiComponents: {
    'Button': '@turbo-super/ui',
    'Card': '@turbo-super/ui',
    'CardContent': '@turbo-super/ui',
    'CardHeader': '@turbo-super/ui',
    'CardTitle': '@turbo-super/ui',
    'CardDescription': '@turbo-super/ui',
    'CardFooter': '@turbo-super/ui',
    'Input': '@turbo-super/ui',
    'Badge': '@turbo-super/ui',
    'Tabs': '@turbo-super/ui',
    'TabsList': '@turbo-super/ui',
    'TabsTrigger': '@turbo-super/ui',
    'TabsContent': '@turbo-super/ui',
    'Textarea': '@turbo-super/ui',
    'Label': '@turbo-super/ui',
    'Separator': '@turbo-super/ui',
  },
  
  // Утилиты для миграции из @turbo-super/shared
  sharedUtils: {
    'formatDate': '@turbo-super/shared',
    'formatDateTime': '@turbo-super/shared',
    'formatRelativeTime': '@turbo-super/shared',
    'formatNumber': '@turbo-super/shared',
    'formatFileSize': '@turbo-super/shared',
    'formatDuration': '@turbo-super/shared',
    'truncateText': '@turbo-super/shared',
    'capitalizeFirst': '@turbo-super/shared',
    'slugify': '@turbo-super/shared',
    'formatCurrency': '@turbo-super/shared',
    'formatPercentage': '@turbo-super/shared',
    'isValidEmail': '@turbo-super/shared',
    'isValidUrl': '@turbo-super/shared',
    'isValidPhone': '@turbo-super/shared',
    'isValidPassword': '@turbo-super/shared',
    'isValidFileSize': '@turbo-super/shared',
    'isValidFileType': '@turbo-super/shared',
    'isValidTextLength': '@turbo-super/shared',
    'validateRequired': '@turbo-super/shared',
    'validateObject': '@turbo-super/shared',
    'hasErrors': '@turbo-super/shared',
    'isValidId': '@turbo-super/shared',
    'isValidUUID': '@turbo-super/shared',
    'isValidDate': '@turbo-super/shared',
    'isValidNumberRange': '@turbo-super/shared',
    'isValidArray': '@turbo-super/shared',
    'useDebounce': '@turbo-super/shared',
    'useLocalStorage': '@turbo-super/shared',
    'useMediaQuery': '@turbo-super/shared',
    'useClickOutside': '@turbo-super/shared',
    'useIsMobile': '@turbo-super/shared',
    'useIsTablet': '@turbo-super/shared',
    'useIsDesktop': '@turbo-super/shared',
    'useIsDarkMode': '@turbo-super/shared',
    'useIsReducedMotion': '@turbo-super/shared',
  },
  
  // Типы для миграции из @turbo-super/data
  dataTypes: {
    'Artifact': '@turbo-super/data',
    'ImageArtifact': '@turbo-super/data',
    'VideoArtifact': '@turbo-super/data',
    'TextArtifact': '@turbo-super/data',
    'SheetArtifact': '@turbo-super/data',
    'ScriptArtifact': '@turbo-super/data',
    'ApiResponse': '@turbo-super/data',
    'PaginatedResponse': '@turbo-super/data',
    'User': '@turbo-super/data',
    'Session': '@turbo-super/data',
    'Message': '@turbo-super/data',
    'Chat': '@turbo-super/data',
    'AI_MODELS': '@turbo-super/data',
    'STATUS': '@turbo-super/data',
    'ARTIFACT_TYPES': '@turbo-super/data',
    'USER_ROLES': '@turbo-super/data',
    'MESSAGE_ROLES': '@turbo-super/data',
    'API_ENDPOINTS': '@turbo-super/data',
    'IMAGE_SIZES': '@turbo-super/data',
    'VIDEO_SIZES': '@turbo-super/data',
    'FILE_FORMATS': '@turbo-super/data',
    'LIMITS': '@turbo-super/data',
    'PAGINATION': '@turbo-super/data',
    'TIME': '@turbo-super/data',
    'ERROR_CODES': '@turbo-super/data',
    'NOTIFICATION_TYPES': '@turbo-super/data',
  }
}

// Паттерны для поиска импортов
const IMPORT_PATTERNS = {
  // Локальные импорты компонентов
  localComponents: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/components\/ui\/([^'"]+)['"]/g,
  
  // Локальные импорты утилит
  localUtils: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/lib\/utils['"]/g,
  
  // Локальные импорты типов
  localTypes: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/types\/([^'"]+)['"]/g,
}

// Функция для рекурсивного обхода директорий
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath, callback)
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      callback(filePath)
    }
  }
}

// Функция для замены импортов
function replaceImports(content, filePath) {
  let modified = false
  let newContent = content
  
  // Заменяем импорты компонентов
  newContent = newContent.replace(IMPORT_PATTERNS.localComponents, (match, imports, componentPath) => {
    const importNames = imports.split(',').map(name => name.trim())
    const componentName = path.basename(componentPath, path.extname(componentPath))
    
    if (MIGRATION_CONFIG.uiComponents[componentName]) {
      modified = true
      return `import { ${importNames.join(', ')} } from '${MIGRATION_CONFIG.uiComponents[componentName]}'`
    }
    
    return match
  })
  
  // Заменяем импорты утилит
  newContent = newContent.replace(IMPORT_PATTERNS.localUtils, (match, imports) => {
    const importNames = imports.split(',').map(name => name.trim())
    const migratedImports = []
    const remainingImports = []
    
    for (const importName of importNames) {
      if (MIGRATION_CONFIG.sharedUtils[importName]) {
        migratedImports.push(importName)
      } else {
        remainingImports.push(importName)
      }
    }
    
    if (migratedImports.length > 0) {
      modified = true
      const newImports = []
      
      // Группируем импорты по пакетам
      const packageGroups = {}
      for (const importName of migratedImports) {
        const packageName = MIGRATION_CONFIG.sharedUtils[importName]
        if (!packageGroups[packageName]) {
          packageGroups[packageName] = []
        }
        packageGroups[packageName].push(importName)
      }
      
      // Создаем новые импорты
      for (const [packageName, names] of Object.entries(packageGroups)) {
        newImports.push(`import { ${names.join(', ')} } from '${packageName}'`)
      }
      
      // Добавляем оставшиеся локальные импорты
      if (remainingImports.length > 0) {
        newImports.push(`import { ${remainingImports.join(', ')} } from '@/lib/utils'`)
      }
      
      return newImports.join('\n')
    }
    
    return match
  })
  
  // Заменяем импорты типов
  newContent = newContent.replace(IMPORT_PATTERNS.localTypes, (match, imports, typePath) => {
    const importNames = imports.split(',').map(name => name.trim())
    const migratedImports = []
    const remainingImports = []
    
    for (const importName of importNames) {
      if (MIGRATION_CONFIG.dataTypes[importName]) {
        migratedImports.push(importName)
      } else {
        remainingImports.push(importName)
      }
    }
    
    if (migratedImports.length > 0) {
      modified = true
      const newImports = []
      
      // Группируем импорты по пакетам
      const packageGroups = {}
      for (const importName of migratedImports) {
        const packageName = MIGRATION_CONFIG.dataTypes[importName]
        if (!packageGroups[packageName]) {
          packageGroups[packageName] = []
        }
        packageGroups[packageName].push(importName)
      }
      
      // Создаем новые импорты
      for (const [packageName, names] of Object.entries(packageGroups)) {
        newImports.push(`import { ${names.join(', ')} } from '${packageName}'`)
      }
      
      // Добавляем оставшиеся локальные импорты
      if (remainingImports.length > 0) {
        newImports.push(`import { ${remainingImports.join(', ')} } from '@/types/${typePath}'`)
      }
      
      return newImports.join('\n')
    }
    
    return match
  })
  
  return { content: newContent, modified }
}

// Основная функция миграции
function migrateApp(appPath) {
  console.log(`\n🔧 Миграция приложения: ${appPath}`)
  
  let totalFiles = 0
  let modifiedFiles = 0
  
  walkDirectory(appPath, (filePath) => {
    totalFiles++
    
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const { content: newContent, modified } = replaceImports(content, filePath)
      
      if (modified) {
        fs.writeFileSync(filePath, newContent)
        modifiedFiles++
        console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`)
      }
    } catch (error) {
      console.error(`  ❌ Ошибка обработки ${filePath}:`, error.message)
    }
  })
  
  console.log(`  📊 Обработано файлов: ${totalFiles}, изменено: ${modifiedFiles}`)
}

// Функция для удаления дублированных файлов
function removeDuplicatedFiles(appPath) {
  console.log(`\n🗑️  Удаление дублированных файлов в: ${appPath}`)
  
  const filesToRemove = [
    'src/components/ui/button.tsx',
    'src/components/ui/card.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/badge.tsx',
    'src/components/ui/tabs.tsx',
    'src/components/ui/textarea.tsx',
    'src/components/ui/label.tsx',
    'src/components/ui/separator.tsx',
  ]
  
  let removedFiles = 0
  
  for (const file of filesToRemove) {
    const filePath = path.join(appPath, file)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        removedFiles++
        console.log(`  ✅ Удален: ${file}`)
      } catch (error) {
        console.error(`  ❌ Ошибка удаления ${file}:`, error.message)
      }
    }
  }
  
  console.log(`  📊 Удалено файлов: ${removedFiles}`)
}

// Главная функция
function main() {
  console.log('🚀 Начинаем миграцию на общие пакеты...')
  
  const apps = ['apps/super-landing', 'apps/super-chatbot']
  
  for (const app of apps) {
    if (fs.existsSync(app)) {
      migrateApp(app)
      removeDuplicatedFiles(app)
    } else {
      console.log(`⚠️  Приложение не найдено: ${app}`)
    }
  }
  
  console.log('\n✅ Миграция завершена!')
  console.log('\n📋 Следующие шаги:')
  console.log('1. Установите зависимости: pnpm install')
  console.log('2. Соберите пакеты: pnpm build')
  console.log('3. Проверьте, что все работает: pnpm dev')
  console.log('4. Исправьте оставшиеся ошибки импортов вручную')
}

// Запуск скрипта
if (require.main === module) {
  main()
}

module.exports = { migrateApp, removeDuplicatedFiles } 
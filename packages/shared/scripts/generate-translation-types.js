#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Путь к английскому словарю
const enDictionaryPath = path.join(__dirname, '../src/translation/dictionaries/super-landing/en.ts');
const typesOutputPath = path.join(__dirname, '../src/translation/types.ts');

// Функция для извлечения ключей из объекта
function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(`"${fullKey}"`);
    } else if (Array.isArray(value)) {
      // Для массивов добавляем ключ как есть
      keys.push(`"${fullKey}"`);
    } else if (value && typeof value === 'object') {
      // Рекурсивно обрабатываем вложенные объекты
      keys.push(...extractKeys(value, fullKey));
    }
  }
  
  return keys;
}

// Функция для чтения и парсинга словаря
function parseDictionary(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Создаем временный JavaScript файл
  const jsContent = content
    .replace(/import type { NestedDictionary } from "\.\.\/\.\.\/types";/, 'const NestedDictionary = {};')
    .replace(/export const en: NestedDictionary = /, 'const en = ')
    .replace(/export const en = /, 'const en = ')
    .replace(/} as const;/, '}; module.exports = en;')
    .replace(/;$/, '; module.exports = en;');
  
  // Создаем временный файл
  const tempJsPath = path.join(__dirname, 'temp-dict.js');
  fs.writeFileSync(tempJsPath, jsContent);
  
  try {
    // Выполняем временный файл
    const dictionary = require(tempJsPath);
    
    // Удаляем временный файл
    fs.unlinkSync(tempJsPath);
    
    return dictionary;
  } catch (error) {
    // Удаляем временный файл в случае ошибки
    if (fs.existsSync(tempJsPath)) {
      fs.unlinkSync(tempJsPath);
    }
    throw new Error(`Ошибка при парсинге словаря: ${error.message}`);
  }
}

// Функция для генерации типов
function generateTypes(dictionary) {
  const keys = extractKeys(dictionary);
  
  return `// Auto-generated translation types
// Generated from: packages/shared/src/translation/dictionaries/super-landing/en.ts
// Run: npm run generate-types

// Translation system types
export type Locale = "en" | "ru" | "tr" | "es" | "hi";

export interface LocaleConfig {
  defaultLocale: Locale;
  locales: Locale[];
  localeDetection: boolean;
  domains?: Record<string, Locale>;
  cookieName: string;
  cookieMaxAge: number;
  preserveRouteOnHome: boolean;
}

export interface LocaleMap {
  en: string;
  ru: string;
  tr: string;
  es: string;
  hi: string;
}

export interface Dictionary {
  [key: string]: string | Dictionary;
}

export interface TranslationConfig {
  i18n: LocaleConfig;
  localeMap: LocaleMap;
}

export type NestedDictionary = {
  [key: string]: string | NestedDictionary | (string | NestedDictionary)[];
};

// Auto-generated translation key type
export type SuperLandingTranslationKey = ${keys.join(' | ')};
`;
}

// Основная функция
function main() {
  try {
    console.log('🔍 Читаю английский словарь...');
    const dictionary = parseDictionary(enDictionaryPath);
    
    console.log('📝 Генерирую типы...');
    const typesContent = generateTypes(dictionary);
    
    console.log('💾 Записываю типы в файл...');
    fs.writeFileSync(typesOutputPath, typesContent);
    
    console.log('✅ Типы успешно сгенерированы!');
    console.log(`📁 Файл: ${typesOutputPath}`);
    console.log(`🔑 Всего ключей: ${extractKeys(dictionary).length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при генерации типов:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { generateTypes, extractKeys };

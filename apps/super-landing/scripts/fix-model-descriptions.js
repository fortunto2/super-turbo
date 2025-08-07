const fs = require('fs');
const path = require('path');

// Описания для русских файлов
const ruDescriptions = {
  'google-imagen-4': 'Высококачественная генерация изображений от Google',
  'veo2': 'Преобразование изображений в динамическое видео',
  'veo3': 'Продвинутая генерация видео с улучшенным качеством',
  'sora': 'Генерация видео из текста с высоким качеством',
  'kling-2-1': 'Создание видео из изображений с помощью Kling',
  'gpt-image-1': 'Генерация изображений с помощью GPT',
  'flux-kontext': 'Создание изображений с контекстным пониманием'
};

// Описания для английских файлов
const enDescriptions = {
  'google-imagen-4': 'High-fidelity image generation from Google',
  'veo2': 'Transform images into dynamic videos',
  'veo3': 'Advanced video generation with improved quality',
  'sora': 'High-quality text-to-video generation',
  'kling-2-1': 'Create videos from images using Kling',
  'gpt-image-1': 'Image generation using GPT',
  'flux-kontext': 'Create images with contextual understanding'
};

// SEO описания для русских файлов
const ruSeoDescriptions = {
  'google-imagen-4': 'Советы по промптам для Imagen 4',
  'veo2': 'Руководство по использованию VEO2',
  'veo3': 'Руководство по использованию VEO3',
  'sora': 'Руководство по использованию Sora',
  'kling-2-1': 'Руководство по использованию Kling 2.1',
  'gpt-image-1': 'Руководство по использованию GPT Image 1',
  'flux-kontext': 'Руководство по использованию Flux Kontext'
};

// SEO описания для английских файлов
const enSeoDescriptions = {
  'google-imagen-4': 'Prompt tips for Imagen 4',
  'veo2': 'VEO2 Usage Guide',
  'veo3': 'VEO3 Usage Guide',
  'sora': 'Sora Usage Guide',
  'kling-2-1': 'Kling 2.1 Usage Guide',
  'gpt-image-1': 'GPT Image 1 Usage Guide',
  'flux-kontext': 'Flux Kontext Usage Guide'
};

function fixFile(filePath, locale) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем, есть ли уже description
    if (content.includes('description:')) {
      console.log(`✅ ${filePath} уже содержит description`);
      return;
    }

    // Извлекаем slug из имени файла
    const fileName = path.basename(filePath, '.mdx');
    const descriptions = locale === 'ru' ? ruDescriptions : enDescriptions;
    const seoDescriptions = locale === 'ru' ? ruSeoDescriptions : enSeoDescriptions;
    
    const description = descriptions[fileName];
    const seoDescription = seoDescriptions[fileName];
    
    if (!description) {
      console.log(`⚠️  Нет описания для ${fileName} в ${locale}`);
      return;
    }

    // Добавляем description после title
    let newContent = content.replace(
      /title: "([^"]+)"/,
      `title: "$1"\ndescription: "${description}"`
    );

    // Добавляем seo description если есть seo секция
    if (newContent.includes('seo:') && seoDescription) {
      newContent = newContent.replace(
        /(seo:\s*\n\s*title: "[^"]+")/,
        `$1\n  description: "${seoDescription}"`
      );
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Исправлен ${filePath}`);
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath, locale) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    if (file.endsWith('.mdx')) {
      const filePath = path.join(dirPath, file);
      fixFile(filePath, locale);
    }
  });
}

// Обрабатываем русские файлы
console.log('🔧 Исправляем русские файлы...');
const ruDir = path.join(__dirname, '../src/content/blog/ru');
processDirectory(ruDir, 'ru');

// Обрабатываем английские файлы
console.log('🔧 Исправляем английские файлы...');
const enDir = path.join(__dirname, '../src/content/blog/en');
processDirectory(enDir, 'en');

console.log('✅ Готово!'); 
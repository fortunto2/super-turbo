const fs = require('fs');
const path = require('path');

// Конфигурации для каждой модели
const modelConfigs = {
  'google-imagen-4': {
    modelName: 'Google Imagen 4',
    modelConfig: {
      width: 1080,
      height: 1080,
      aspectRatio: '1:1',
      style: 'flux_watercolor',
      shotSize: 'Medium Shot',
      description: 'Google Imagen 4 - генерация высококачественных изображений с отличной текстурой и типографикой'
    }
  },
  'gpt-image-1': {
    modelName: 'GPT-Image-1',
    modelConfig: {
      width: 1024,
      height: 1024,
      aspectRatio: '1:1',
      style: 'flux_realistic',
      shotSize: 'Medium Shot',
      description: 'GPT-Image-1 - FLUX модель для генерации реалистичных изображений'
    }
  },
  'flux-kontext': {
    modelName: 'Flux Kontext',
    modelConfig: {
      width: 1024,
      height: 1024,
      aspectRatio: '1:1',
      style: 'flux_steampunk',
      shotSize: 'Medium Shot',
      description: 'Flux Kontext - FLUX модель для генерации изображений в стиле steampunk'
    }
  },
  'sora': {
    modelName: 'Sora',
    modelConfig: {
      maxDuration: 10,
      aspectRatio: '16:9',
      width: 1920,
      height: 1080,
      frameRate: 30,
      description: 'Sora - экспериментальная модель OpenAI для генерации коротких горизонтальных видео'
    }
  },
  'kling-2-1': {
    modelName: 'Kling 2.1',
    modelConfig: {
      maxDuration: 10,
      aspectRatio: '16:9',
      width: 1280,
      height: 720,
      frameRate: 30,
      description: 'Kling 2.1 - быстрая генерация коротких видео клипов с плавными движениями'
    }
  },
  'veo2': {
    modelName: 'Veo2',
    modelConfig: {
      maxDuration: 8,
      aspectRatio: '16:9',
      width: 1280,
      height: 720,
      frameRate: 30,
      description: 'Veo2 - преобразование статичных изображений в динамичные HD видео с сохранением оригинального стиля'
    }
  },
  'veo3': {
    modelName: 'Veo3',
    modelConfig: {
      maxDuration: 8,
      aspectRatio: '16:9',
      width: 1280,
      height: 720,
      frameRate: 30,
      description: 'Veo3 - новейшая модель Google для генерации видео из текста с высоким качеством'
    }
  }
};

// Языки для обработки
const languages = ['en', 'es', 'hi'];

function addModelConfigsToFile(filePath, slug) {
  if (!fs.existsSync(filePath)) {
    console.log(`Файл не найден: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Проверяем, есть ли уже modelName
  if (content.includes('modelName:')) {
    console.log(`Пропускаем ${filePath} - уже имеет конфигурацию`);
    return;
  }

  const config = modelConfigs[slug];
  if (!config) {
    console.log(`Нет конфигурации для ${slug}`);
    return;
  }

  // Находим позицию после locale
  const localeMatch = content.match(/locale:\s*["']?(\w+)["']?/);
  if (!localeMatch) {
    console.log(`Не найден locale в ${filePath}`);
    return;
  }

  const localeEnd = content.indexOf(localeMatch[0]) + localeMatch[0].length;
  const beforeLocale = content.substring(0, localeEnd);
  const afterLocale = content.substring(localeEnd);

  // Формируем новую конфигурацию
  const modelConfigYaml = `\nmodelName: "${config.modelName}"\nmodelConfig:\n` +
    Object.entries(config.modelConfig)
      .map(([key, value]) => `  ${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join('\n');

  const newContent = beforeLocale + modelConfigYaml + afterLocale;

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Обновлен: ${filePath}`);
}

// Обрабатываем все языки
languages.forEach(lang => {
  const langDir = path.join(__dirname, '..', 'src', 'content', 'blog', lang);
  
  if (!fs.existsSync(langDir)) {
    console.log(`Директория не найдена: ${langDir}`);
    return;
  }

  Object.keys(modelConfigs).forEach(slug => {
    const filePath = path.join(langDir, `${slug}.mdx`);
    addModelConfigsToFile(filePath, slug);
  });
});

console.log('Готово!'); 
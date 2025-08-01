# @turbo-super/ai-tools

Универсальный пакет для работы с AI-инструментами генерации контента. Включает в себя компоненты, хуки и типы для создания изображений, видео, улучшения промптов и генерации скриптов.

## 🚀 Возможности

- **Image Generation** - Генерация изображений с помощью AI моделей
- **Video Generation** - Создание видео с использованием AI
- **Prompt Enhancement** - Улучшение промптов для лучших результатов
- **Script Generation** - Генерация профессиональных скриптов
- **Reusable Hooks** - Переиспользуемые React хуки для управления состоянием
- **TypeScript Support** - Полная поддержка TypeScript
- **Customizable UI** - Настраиваемые компоненты интерфейса

## 📦 Установка

```bash
pnpm add @turbo-super/ai-tools
```

## 🎯 Быстрый старт

### Основные компоненты

```tsx
import {
  ImageGeneratorPage,
  VideoGeneratorPage,
  PromptEnhancerPage,
  ScriptGeneratorPage,
  ToolsPage
} from '@turbo-super/ai-tools';

// Страница с генерацией изображений
<ImageGeneratorPage
  onGenerate={async (params) => {
    // Ваша логика генерации изображений
    return generatedImage;
  }}
  onSuccess={(result) => console.log('Image generated:', result)}
  onError={(error) => console.error('Generation failed:', error)}
/>

// Страница с генерацией видео
<VideoGeneratorPage
  onGenerate={async (params) => {
    // Ваша логика генерации видео
    return generatedVideo;
  }}
/>

// Страница улучшения промптов
<PromptEnhancerPage
  onEnhance={async (params) => {
    // Ваша логика улучшения промпта
    return enhancedPrompt;
  }}
/>

// Страница генерации скриптов
<ScriptGeneratorPage
  onGenerate={async (params) => {
    // Ваша логика генерации скрипта
    return generatedScript;
  }}
/>

// Главная страница всех инструментов
<ToolsPage />
```

### Использование хуков

```tsx
import {
  useImageGenerator,
  useVideoGenerator,
  usePromptEnhancer,
} from "@turbo-super/ai-tools";

function MyComponent() {
  const imageGenerator = useImageGenerator({
    onGenerate: async (params) => {
      // API вызов для генерации изображения
      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: JSON.stringify(params),
      });
      return response.json();
    },
    onSuccess: (image) => {
      console.log("Image generated:", image);
    },
    onError: (error) => {
      console.error("Generation failed:", error);
    },
  });

  const handleGenerate = () => {
    imageGenerator.generateImage({
      prompt: "A beautiful sunset over mountains",
      model: "flux-pro",
      width: 1024,
      height: 1024,
    });
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={imageGenerator.isGenerating}
      >
        {imageGenerator.isGenerating ? "Generating..." : "Generate Image"}
      </button>

      {imageGenerator.generatedImages.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt={image.prompt}
        />
      ))}
    </div>
  );
}
```

## 📚 Компоненты

### Image Generator Components

- `ImageGeneratorPage` - Полная страница генерации изображений
- `ImageGeneratorForm` - Форма для ввода параметров генерации
- `ImageGallery` - Галерея сгенерированных изображений
- `GenerationProgress` - Индикатор прогресса генерации

### Video Generator Components

- `VideoGeneratorPage` - Полная страница генерации видео
- `VideoGeneratorForm` - Форма для ввода параметров генерации
- `VideoGallery` - Галерея сгенерированных видео

### Prompt Enhancer Components

- `PromptEnhancerPage` - Полная страница улучшения промптов
- `PromptEnhancerForm` - Форма для улучшения промптов

### Script Generator Components

- `ScriptGeneratorPage` - Полная страница генерации скриптов
- `ScriptGeneratorForm` - Форма для генерации скриптов

### Utility Components

- `ToolsPage` - Главная страница всех инструментов
- `ToolsGrid` - Сетка инструментов
- `ToolIcon` - Иконки для инструментов

## 🔧 Хуки

### useImageGenerator

Хук для управления генерацией изображений.

```tsx
const {
  generationStatus,
  currentGeneration,
  generatedImages,
  isGenerating,
  generateImage,
  clearCurrentGeneration,
  deleteImage,
  clearAllImages,
  forceCheckResults,
  downloadImage,
  copyImageUrl,
} = useImageGenerator({
  onGenerate: async (params) => {
    /* ваша логика */
  },
  onSuccess: (result) => {
    /* обработка успеха */
  },
  onError: (error) => {
    /* обработка ошибки */
  },
});
```

### useVideoGenerator

Хук для управления генерацией видео.

```tsx
const {
  generationStatus,
  currentGeneration,
  generatedVideos,
  isGenerating,
  generateVideo,
  clearCurrentGeneration,
  deleteVideo,
  clearAllVideos,
  forceCheckResults,
  downloadVideo,
  copyVideoUrl,
} = useVideoGenerator({
  onGenerate: async (params) => {
    /* ваша логика */
  },
  onSuccess: (result) => {
    /* обработка успеха */
  },
  onError: (error) => {
    /* обработка ошибки */
  },
});
```

### usePromptEnhancer

Хук для улучшения промптов.

```tsx
const { isEnhancing, currentEnhanced, enhancePrompt, copyToClipboard, reset } =
  usePromptEnhancer({
    onEnhance: async (params) => {
      /* ваша логика */
    },
    onSuccess: (result) => {
      /* обработка успеха */
    },
    onError: (error) => {
      /* обработка ошибки */
    },
  });
```

## 📝 Типы

```tsx
import type {
  ImageGenerationParams,
  VideoGenerationParams,
  PromptEnhancementParams,
  GeneratedImage,
  GeneratedVideo,
  GenerationStatus,
  ToolConfig,
} from "@turbo-super/ai-tools";
```

## 🎨 Кастомизация

Все компоненты поддерживают кастомизацию через пропсы:

```tsx
<ImageGeneratorPage
  title="Custom Image Generator"
  description="Custom description for your image generator"
  onGenerate={customGenerateFunction}
  onSuccess={customSuccessHandler}
  onError={customErrorHandler}
/>
```

## 🔗 Зависимости

- React 18+
- TypeScript 5+
- @turbo-super/ui
- @turbo-super/shared
- lucide-react

## 📄 Лицензия

MIT

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории проекта.

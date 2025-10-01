/**
 * Демонстрация работы универсальной системы контекста
 * Показывает, как система анализирует контекст для разных типов медиа
 */

import {
  analyzeImageContext,
  analyzeVideoContext,
  analyzeAudioContext,
  analyzeMediaContext,
  contextManager,
} from "./index";

// Примеры использования системы контекста
export async function demonstrateContextSystem() {
  console.log("🎯 Демонстрация универсальной системы контекста");
  console.log("=".repeat(50));

  const chatId = "demo-chat-123";
  const currentAttachments = [
    {
      url: "https://example.com/current-image.jpg",
      contentType: "image/jpeg",
      name: "Current Image",
    },
  ];

  // 1. Анализ контекста для изображений
  console.log("\n🖼️ Анализ контекста для изображений:");
  const imageContext = await analyzeImageContext(
    "измени это изображение, сделай глаза голубыми",
    chatId,
    currentAttachments
  );
  console.log("Результат:", imageContext);

  // 2. Анализ контекста для видео
  console.log("\n🎬 Анализ контекста для видео:");
  const videoContext = await analyzeVideoContext(
    "добавь музыку к этому ролику",
    chatId,
    currentAttachments
  );
  console.log("Результат:", videoContext);

  // 2.1. Анализ контекста для image-to-video
  console.log("\n🎬🖼️ Анализ контекста для image-to-video:");
  const imageToVideoContext = await analyzeVideoContext(
    "сделай видео из этого изображения",
    chatId,
    currentAttachments
  );
  console.log("Результат:", imageToVideoContext);

  // 2.2. Анализ контекста для анимации изображения
  console.log("\n🎬✨ Анализ контекста для анимации изображения:");
  const animateContext = await analyzeVideoContext(
    "оживи эту картинку",
    chatId,
    currentAttachments
  );
  console.log("Результат:", animateContext);

  // 3. Анализ контекста для аудио
  console.log("\n🎵 Анализ контекста для аудио:");
  const audioContext = await analyzeAudioContext(
    "озвучь этот текст",
    chatId,
    currentAttachments
  );
  console.log("Результат:", audioContext);

  // 4. Универсальная функция
  console.log("\n🔧 Универсальная функция:");
  const universalContext = await analyzeMediaContext(
    "image",
    "подправь это изображение",
    chatId,
    currentAttachments
  );
  console.log("Результат:", universalContext);

  // 5. Прямое использование менеджера
  console.log("\n⚙️ Прямое использование менеджера:");
  const chatMedia = await contextManager.getChatMedia(chatId);
  console.log("Медиа из чата:", chatMedia.length, "файлов");

  const directContext = await contextManager.analyzeContext(
    "video",
    "обрежь это видео",
    chatMedia,
    currentAttachments
  );
  console.log("Результат:", directContext);

  console.log("\n✅ Демонстрация завершена!");
}

// Примеры различных сценариев
export const contextExamples = {
  // Изображения
  image: {
    "измени это изображение": "Прямая ссылка на текущее изображение",
    "сделай глаза голубыми": "Эвристический анализ - редактирование",
    "подправь последнее фото": "Ссылка на последнее изображение",
    "измени сгенерированную картинку": "Ссылка на сгенерированное изображение",
    "на этом изображении": "Контекстная ссылка",
  },

  // Видео
  video: {
    "добавь музыку к этому ролику": "Прямая ссылка на текущее видео",
    "обрежь видео": "Эвристический анализ - редактирование",
    "подправь последний клип": "Ссылка на последнее видео",
    "измени сгенерированное видео": "Ссылка на сгенерированное видео",
    "в этом ролике": "Контекстная ссылка",
  },

  // Image-to-Video
  imageToVideo: {
    "сделай видео из этого изображения": "Создание видео из изображения",
    "оживи эту картинку": "Анимация изображения",
    "анимируй это изображение": "Анимация изображения",
    "создай ролик из этой картинки": "Создание видео из изображения",
    "это изображение в видео": "Преобразование изображения в видео",
    "make video from this image": "Создание видео из изображения (англ.)",
    "animate this picture": "Анимация изображения (англ.)",
    "bring this image to life": "Оживление изображения (англ.)",
  },

  // Аудио
  audio: {
    "озвучь этот текст": "Эвристический анализ - озвучка",
    "добавь музыку": "Эвристический анализ - музыка",
    "измени этот звук": "Прямая ссылка на текущее аудио",
    "подправь последний трек": "Ссылка на последнее аудио",
    "в этой музыке": "Контекстная ссылка",
  },
};

// Функция для тестирования различных сценариев
export async function testContextScenarios() {
  console.log("🧪 Тестирование различных сценариев");
  console.log("=".repeat(50));

  const chatId = "test-chat-456";

  for (const [mediaType, scenarios] of Object.entries(contextExamples)) {
    console.log(`\n📱 Тестирование ${mediaType}:`);

    for (const [message, description] of Object.entries(scenarios)) {
      console.log(`\n  💬 "${message}"`);
      console.log(`     Ожидание: ${description}`);

      try {
        const context = await analyzeMediaContext(
          mediaType as "image" | "video" | "audio",
          message,
          chatId
        );

        console.log(`     Результат: ${context.confidence} уверенность`);
        console.log(`     Обоснование: ${context.reasoningText}`);
        if (context.sourceUrl) {
          console.log(`     URL: ${context.sourceUrl}`);
        }
      } catch (error) {
        console.log(`     Ошибка: ${error}`);
      }
    }
  }

  console.log("\n✅ Тестирование завершено!");
}

// Экспорт для использования в других модулях
const contextSystemDemo = {
  demonstrateContextSystem,
  testContextScenarios,
  contextExamples,
};

export default contextSystemDemo;

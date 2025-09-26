import { TestModelConfig, TestBlogPost, TestGeneratorProps } from "./types";

// Тестовые конфигурации моделей
export const testModelConfigs: Record<string, TestModelConfig> = {
  dall_e_3: {
    width: 1024,
    height: 1024,
    aspectRatio: "1:1",
    style: "photorealistic",
    description: "High-quality photorealistic image generation with DALL-E 3",
  },
  dall_e_3_wide: {
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    style: "artistic",
    description: "Wide format artistic image generation",
  },
  dall_e_3_portrait: {
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    style: "cinematic",
    description: "Portrait format cinematic image generation",
  },
  veo_3: {
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description: "High-quality video generation with Veo 3",
  },
  veo_3_long: {
    maxDuration: 15,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    frameRate: 60,
    description: "Long format high-quality video generation",
  },
  enhanced_veo_3: {
    maxDuration: 10,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    frameRate: 60,
    description: "Enhanced video generation with image-to-video support",
  },
  minimal_model: {
    // Минимальная конфигурация для тестирования fallback
  },
  partial_model: {
    width: 1024,
    // height отсутствует
    aspectRatio: "1:1",
    // style отсутствует
  },
  extreme_model: {
    width: 4096,
    height: 4096,
    aspectRatio: "21:9",
    style: "ultra-realistic",
    description: "Extreme resolution ultra-realistic generation",
  },
};

// Тестовые посты блога
export const testBlogPosts: TestBlogPost[] = [
  {
    slug: "test-blog-post",
    locale: "en",
    title: "Test Blog Post",
    description: "A test blog post for testing image generation",
    body: {
      raw: "# Test Heading\n\nThis is test content for image generation.",
      code: "<h1>Test Heading</h1><p>This is test content for image generation.</p>",
    },
    seo: {
      title: "SEO Test Title",
      description: "SEO test description for image generation",
      keywords: ["test", "blog", "ai", "image"],
      ogImage: "/test-image.jpg",
    },
    modelName: "dall_e_3",
    modelConfig: testModelConfigs.dall_e_3,
  },
  {
    slug: "video-blog-post",
    locale: "en",
    title: "Video Blog Post",
    description: "A blog post about video generation",
    body: {
      raw: "# Video Generation\n\nLearn about AI video generation with Veo 3.",
      code: "<h1>Video Generation</h1><p>Learn about AI video generation with Veo 3.</p>",
    },
    seo: {
      title: "Video Generation Blog",
      description: "Learn about AI video generation with Veo 3",
      keywords: ["video", "ai", "generation", "veo"],
      ogImage: "/video-image.jpg",
    },
    modelName: "veo_3",
    modelConfig: testModelConfigs.veo_3,
  },
  {
    slug: "enhanced-video-post",
    locale: "en",
    title: "Enhanced Video Post",
    description: "A blog post about enhanced video generation",
    body: {
      raw: "# Enhanced Video\n\nAdvanced video generation features with image-to-video support.",
      code: "<h1>Enhanced Video</h1><p>Advanced video generation features with image-to-video support.</p>",
    },
    seo: {
      title: "Enhanced Video Generation",
      description: "Advanced AI video generation with image-to-video support",
      keywords: ["enhanced", "video", "ai", "image-to-video"],
      ogImage: "/enhanced-video.jpg",
    },
    modelName: "enhanced_veo_3",
    modelConfig: testModelConfigs.enhanced_veo_3,
  },
  {
    slug: "no-model-post",
    locale: "en",
    title: "Post Without Model",
    description: "A blog post without model configuration",
    body: {
      raw: "# No Model\n\nThis post has no model configuration.",
      code: "<h1>No Model</h1><p>This post has no model configuration.</p>",
    },
    seo: {
      title: "No Model Post",
      description: "A post without model configuration",
      keywords: ["blog", "post"],
      ogImage: null,
    },
  },
  {
    slug: "no-h1-post",
    locale: "en",
    title: "Post Without H1",
    description: "A post without H1 heading",
    body: {
      raw: "This content has no H1 heading. It starts with regular text.",
      code: "<p>This content has no H1 heading. It starts with regular text.</p>",
    },
    seo: {
      title: "No H1 Post",
      description: "A post without H1 heading",
      keywords: ["blog", "post"],
      ogImage: null,
    },
  },
  {
    slug: "turkish-only-post",
    locale: "tr",
    title: "Turkish Post",
    description: "A post only in Turkish",
    body: {
      raw: "# Turkish Post\n\nThis is a Turkish post for testing fallback locale.",
      code: "<h1>Turkish Post</h1><p>This is a Turkish post for testing fallback locale.</p>",
    },
    seo: {
      title: "Turkish Post",
      description: "A post only in Turkish",
      keywords: ["turkish", "post"],
      ogImage: null,
    },
  },
];

// Тестовые пропсы для генераторов
export const testGeneratorProps: Record<string, TestGeneratorProps> = {
  imageGenerator: {
    modelName: "dall_e_3",
    locale: "en",
    modelConfig: testModelConfigs.dall_e_3,
  },
  videoGenerator: {
    modelName: "veo_3",
    locale: "en",
    modelConfig: testModelConfigs.veo_3,
  },
  enhancedVideoGenerator: {
    modelName: "enhanced_veo_3",
    locale: "en",
    modelConfig: testModelConfigs.enhanced_veo_3,
  },
  minimalGenerator: {
    modelName: "minimal_model",
    locale: "en",
  },
  partialGenerator: {
    modelName: "partial_model",
    locale: "en",
    modelConfig: testModelConfigs.partial_model,
  },
  extremeGenerator: {
    modelName: "extreme_model",
    locale: "en",
    modelConfig: testModelConfigs.extreme_model,
  },
};

// Тестовые локали
export const testLocales = ["en", "tr", "ru"] as const;

// Тестовые URL для перенаправлений
export const testRedirectUrls = {
  image: {
    en: "http://localhost:3000/en/generate-image",
    tr: "http://localhost:3000/tr/generate-image",
    ru: "http://localhost:3000/ru/generate-image",
  },
  video: {
    en: "http://localhost:3000/en/generate-video",
    tr: "http://localhost:3000/tr/generate-video",
    ru: "http://localhost:3000/ru/generate-video",
  },
  enhancedVideo: {
    en: "http://localhost:3000/en/generate-enhanced-video",
    tr: "http://localhost:3000/tr/generate-enhanced-video",
    ru: "http://localhost:3000/ru/generate-enhanced-video",
  },
};

// Тестовые переводы
export const testTranslations: Record<string, Record<string, string>> = {
  en: {
    "image_generator.title": "Generate Image",
    "video_generator.title": "Generate Video",
    "navbar.home": "Home",
    "navbar.blog": "Blog",
    "model_descriptions.dall_e_3": "Create images with DALL-E 3",
    "model_descriptions.veo_3": "Generate videos with Veo 3",
    "model_descriptions.enhanced_veo_3":
      "Enhanced video generation with image-to-video support",
  },
  tr: {
    "image_generator.title": "Resim Oluştur",
    "video_generator.title": "Video Oluştur",
    "navbar.home": "Ana Sayfa",
    "navbar.blog": "Blog",
    "model_descriptions.dall_e_3": "DALL-E 3 ile resim oluşturun",
    "model_descriptions.veo_3": "Veo 3 ile video oluşturun",
    "model_descriptions.enhanced_veo_3":
      "Gelişmiş video oluşturma ve resimden video desteği",
  },
  ru: {
    "image_generator.title": "Создать изображение",
    "video_generator.title": "Создать видео",
    "navbar.home": "Главная",
    "navbar.blog": "Блог",
    "model_descriptions.dall_e_3": "Создавайте изображения с помощью DALL-E 3",
    "model_descriptions.veo_3": "Создавайте видео с помощью Veo 3",
    "model_descriptions.enhanced_veo_3":
      "Улучшенное создание видео с поддержкой image-to-video",
  },
};

// Тестовые сценарии
export const testScenarios = {
  imageGeneration: {
    name: "Image Generation Flow",
    steps: [
      "User reads blog post with image model",
      "User sees image generator component",
      "User views model configuration",
      "User clicks generate button",
      "User is redirected to image generation page",
    ],
  },
  videoGeneration: {
    name: "Video Generation Flow",
    steps: [
      "User reads blog post with video model",
      "User sees video generator component",
      "User views model configuration",
      "User clicks generate button",
      "User is redirected to video generation page",
    ],
  },
  enhancedVideoGeneration: {
    name: "Enhanced Video Generation Flow",
    steps: [
      "User reads blog post with enhanced video model",
      "User sees enhanced video generator component",
      "User views advanced model configuration",
      "User clicks generate button",
      "User is redirected to enhanced video generation page",
    ],
  },
};

// Тестовые edge cases
export const testEdgeCases = {
  emptyModelName: {
    modelName: "",
    locale: "en",
    modelConfig: testModelConfigs.dall_e_3,
  },
  nullModelConfig: {
    modelName: "test_model",
    locale: "en",
    modelConfig: null as unknown,
  },
  undefinedLocale: {
    modelName: "dall_e_3",
    locale: undefined as unknown,
    modelConfig: testModelConfigs.dall_e_3,
  },
  specialCharacters: {
    modelName: "dall-e-3",
    locale: "en",
    modelConfig: testModelConfigs.dall_e_3,
  },
  spacesInName: {
    modelName: "Google Veo 3",
    locale: "en",
    modelConfig: testModelConfigs.veo_3,
  },
};

// Тестовые конфигурации для accessibility
export const testAccessibilityConfig = {
  buttonLabels: [
    "Generate Image",
    "Generate Video",
    "Create Image",
    "Create Video",
  ],
  imageAlts: [
    "Model configuration display",
    "Generation button",
    "Model information card",
  ],
  ariaLabels: [
    "Model configuration",
    "Generation controls",
    "Model parameters",
  ],
};

// Тестовые метрики производительности
export const testPerformanceMetrics = {
  renderTime: {
    threshold: 100, // ms
    acceptable: 50,
    excellent: 25,
  },
  memoryUsage: {
    threshold: 50, // MB
    acceptable: 30,
    excellent: 20,
  },
  bundleSize: {
    threshold: 100, // KB
    acceptable: 75,
    excellent: 50,
  },
};

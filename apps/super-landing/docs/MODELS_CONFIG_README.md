# Система конфигурации моделей

## Обзор

Новая система конфигурации моделей позволяет централизованно управлять всеми AI моделями и их возможностями. Система автоматически определяет, какие модели поддерживают image-to-video, text-to-video или только генерацию изображений.

## Структура конфигурации

### Файл конфигурации: `src/lib/models-config.ts`

```typescript
export interface ModelConfig {
  name: string; // Название модели
  type: "video" | "image"; // Тип модели
  supportsImageToVideo: boolean; // Поддерживает ли image-to-video
  supportsTextToVideo: boolean; // Поддерживает ли text-to-video
  maxDuration?: number; // Максимальная длительность (для видео)
  aspectRatio?: string; // Соотношение сторон
  width?: number; // Ширина
  height?: number; // Высота
  frameRate?: number; // Частота кадров (для видео)
  description?: string; // Описание модели
  generationConfigName?: string; // Имя конфигурации для API
}
```

## Поддерживаемые модели

### Видео модели (Video Models)

#### Veo2 & Veo3 (Image-to-Video + Text-to-Video)

- **Поддержка**: Image-to-Video ✅, Text-to-Video ✅
- **Длительность**: 8 секунд
- **Разрешение**: 1280x720
- **Соотношение**: 16:9
- **Описание**: Google VEO2/VEO3 - Advanced image-to-video and text-to-video generation

#### Sora (Text-to-Video only)

- **Поддержка**: Image-to-Video ❌, Text-to-Video ✅
- **Длительность**: 10 секунд
- **Разрешение**: 1920x1080
- **Соотношение**: 16:9
- **Описание**: OpenAI Sora - Text-to-video generation

#### Kling 2.1 (Image-to-Video + Text-to-Video)

- **Поддержка**: Image-to-Video ✅, Text-to-Video ✅
- **Длительность**: 10 секунд
- **Разрешение**: 1280x720
- **Соотношение**: 16:9
- **Описание**: KLING 2.1 - Image-to-video and text-to-video generation

#### LTX (Text-to-Video only)

- **Поддержка**: Image-to-Video ❌, Text-to-Video ✅
- **Длительность**: 5 секунд
- **Разрешение**: 1280x720
- **Соотношение**: 16:9
- **Описание**: LTX - Fast text-to-video generation

### Модели изображений (Image Models)

#### Google Imagen 4

- **Поддержка**: Image-to-Video ❌, Text-to-Video ❌
- **Разрешение**: 1024x1024
- **Описание**: Google Imagen 4 - High-quality image generation

#### GPT-Image-1

- **Поддержка**: Image-to-Video ❌, Text-to-Video ❌
- **Разрешение**: 1024x1024
- **Описание**: GPT-Image-1 - OpenAI image generation

#### Flux Kontext

- **Поддержка**: Image-to-Video ❌, Text-to-Video ❌
- **Разрешение**: 1024x1024
- **Описание**: Flux Kontext - Creative image generation

#### Flux Pro

- **Поддержка**: Image-to-Video ❌, Text-to-Video ❌
- **Разрешение**: 1024x1024
- **Описание**: Flux Pro - Professional image generation

#### Imagen4 Ultra

- **Поддержка**: Image-to-Video ❌, Text-to-Video ❌
- **Разрешение**: 1024x1024
- **Описание**: Imagen4 Ultra - Ultra-high quality image generation

## API функции

### Основные функции

```typescript
// Получить конфигурацию модели
getModelConfig(modelName: string): ModelConfig | null

// Проверить поддержку image-to-video
supportsImageToVideo(modelName: string): boolean

// Проверить поддержку text-to-video
supportsTextToVideo(modelName: string): boolean

// Получить тип модели
getModelType(modelName: string): "video" | "image"

// Получить все видео модели
getVideoModels(): ModelConfig[]

// Получить все модели изображений
getImageModels(): ModelConfig[]
```

## Интеграция в компоненты

### 1. BlogModelGenerator

Автоматически определяет тип модели и рендерит соответствующий компонент:

```typescript
// Для видео моделей с поддержкой image-to-video
if (supportsImageToVideo(modelName)) {
  return <EnhancedModelVideoGenerator />
} else {
  return <ModelVideoGenerator />
}

// Для моделей изображений
return <ModelImageGenerator />
```

### 2. EnhancedModelVideoGenerator

Использует конфигурацию для отображения правильных возможностей:

```typescript
const modelConfig = getModelConfig(modelName);
const supportsImageToVideoMode = supportsImageToVideo(modelName);

// Показывает badge "Image-to-Video" только если поддерживается
{config.supportsImageToVideo && (
  <Badge>Image-to-Video</Badge>
)}
```

### 3. Generate Video Page

Показывает загрузку изображения только для моделей, которые это поддерживают:

```typescript
const supportsImageToVideoMode = supportsImageToVideo(modelName);

{/* Показываем загрузку изображения только для image-to-video моделей */}
{supportsImageToVideoMode && (
  <ImageUpload
    required={true}
    title="Upload Source Image"
    description="Required for image-to-video generation"
  />
)}
```

## Валидация

### На странице генерации видео

1. **Обязательное изображение**: Для image-to-video моделей изображение обязательно
2. **Отключенная кнопка**: Кнопка генерации отключена, если не выбрано изображение для image-to-video моделей
3. **Предупреждения**: Показываются предупреждения о необходимости изображения

### В API

1. **Проверка модели**: API проверяет, поддерживает ли модель image-to-video
2. **Валидация payload**: Правильная структура payload в зависимости от типа модели
3. **Fallback логика**: Старая логика остается для совместимости

## Добавление новой модели

### 1. Добавить в конфигурацию

```typescript
"New Model": {
  name: "New Model",
  type: "video", // или "image"
  supportsImageToVideo: true, // или false
  supportsTextToVideo: true,  // или false
  maxDuration: 10,
  aspectRatio: "16:9",
  width: 1920,
  height: 1080,
  frameRate: 30,
  description: "Description of the new model",
  generationConfigName: "provider/model-name",
},
```

### 2. Обновить компоненты (если нужно)

- `EnhancedModelVideoGenerator` - для видео моделей
- `ModelVideoGenerator` - для простых видео моделей
- `ModelImageGenerator` - для моделей изображений

### 3. Протестировать

Используйте тестовую страницу `/test-models` для проверки конфигурации.

## Тестирование

### Тестовая страница: `/test-models`

Показывает:

- Все видео модели с их возможностями
- Все модели изображений
- Индивидуальные тесты для каждой модели
- Проверку конфигурации и поддержки image-to-video

## Преимущества новой системы

1. **Централизованная конфигурация**: Все настройки моделей в одном месте
2. **Автоматическое определение**: Система сама определяет возможности модели
3. **Гибкость**: Легко добавлять новые модели
4. **Валидация**: Автоматическая проверка требований
5. **UX улучшения**: Пользователь видит только нужные опции
6. **Совместимость**: Старая логика остается рабочей

## Миграция

### Что изменилось

1. **Новая конфигурация**: Все модели теперь в `models-config.ts`
2. **Умная логика**: Компоненты автоматически определяют возможности
3. **Улучшенная валидация**: Обязательные поля для image-to-video моделей
4. **Лучший UX**: Пользователь видит только релевантные опции

### Что осталось без изменений

1. **API endpoints**: Все API остаются рабочими
2. **Stripe интеграция**: Платежи работают как раньше
3. **SuperDuperAI**: Интеграция с внешним API не изменилась
4. **Существующие модели**: Все старые модели продолжают работать

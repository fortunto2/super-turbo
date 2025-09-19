# Gemini 2.5 Flash Lite Integration

**Date**: January 15, 2025  
**Type**: Feature Addition  
**Impact**: New AI Model Support

## Overview

Добавлена поддержка Google Gemini 2.5 Flash Lite в чатбот с созданием отдельного специализированного чата для работы с Gemini и VEO3.

## Changes Made

### 1. **AI Provider Configuration** (`lib/ai/providers.ts`)

```typescript
// Добавлен Google AI SDK
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Создан провайдер Google для Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

// Создана модель Gemini 2.5 Flash Lite
const geminiModel = google("gemini-2.5-flash-lite");

// Добавлена в провайдер
"gemini-2.5-flash-lite": geminiModel,
```

### 2. **Model Definitions** (`lib/ai/models.ts`)

```typescript
{
  id: 'gemini-2.5-flash-lite',
  name: 'Gemini 2.5 Flash Lite',
  description: 'Fast and efficient Google Gemini model for quick responses',
}
```

### 3. **User Entitlements** (`lib/ai/entitlements.ts`)

```typescript
// Добавлена для всех типов пользователей
availableChatModelIds: [
  "chat-model",
  "chat-model-reasoning",
  "o3-reasoning",
  "o3-pro-reasoning",
  "gemini-2.5-flash-lite", // New
];
```

### 4. **API Schema Validation** (`app/(chat)/api/chat/schema.ts`)

```typescript
selectedChatModel: z.enum([
  "chat-model",
  "chat-model-reasoning",
  "o3-reasoning",
  "o3-pro-reasoning",
  "gemini-2.5-flash-lite", // New
]);
```

### 5. **Dedicated Gemini Chat API** (`app/(chat)/api/gemini-chat/route.ts`)

- Создан отдельный API endpoint `/api/gemini-chat`
- Специализированный системный промпт для Gemini + VEO3
- Всегда использует модель `gemini-2.5-flash-lite`
- Поддержка всех AI инструментов (изображения, видео, документы)

### 6. **Gemini Chat Pages**

- **Main Page**: `/gemini-chat` - создание нового Gemini чата
- **Chat Page**: `/gemini-chat/[id]` - просмотр существующего Gemini чата

### 7. **UI Components**

- **GeminiChatButton**: Кнопка в сайдбаре для быстрого доступа
- **Updated Chat Component**: Поддержка `isGeminiChat` параметра
- **Navigation Integration**: Добавлена в сайдбар приложения

## Environment Variables Required

Добавьте в ваш `.env.local` файл:

```env
# Vertex AI API Key (ваш существующий ключ)
GOOGLE_AI_API_KEY=AQ.Ab8RN6K1hU7jC3Mdv6IFvbgMjDb3zD_ng99duR9XT56NRyB30g

# Google Cloud Project ID (замените на ваш)
GOOGLE_CLOUD_PROJECT=your-project-id

# Google Cloud Location (обычно us-central1)
GOOGLE_CLOUD_LOCATION=us-central1
```

## API Key Setup

1. **Используйте ваш существующий Vertex AI ключ**: `AQ.Ab8RN6K1hU7jC3Mdv6IFvbgMjDb3zD_ng99duR9XT56NRyB30g`
2. **Укажите ваш Google Cloud Project ID** в `GOOGLE_CLOUD_PROJECT`
3. **Укажите регион** в `GOOGLE_CLOUD_LOCATION` (обычно `us-central1`)
4. Перезапустите приложение

## Troubleshooting

### Ошибка аутентификации

Если видите ошибку:

```
API keys are not supported by this API. Expected OAuth2 access token
```

**Решение**: Убедитесь, что используете Google AI Studio API ключ, а не Vertex AI ключ.

## Features

### Gemini 2.5 Flash Lite

- **Скорость**: Быстрые ответы для простых запросов
- **Эффективность**: Оптимизированная модель для повседневных задач
- **Мультимодальность**: Поддержка текста, изображений, видео

### VEO3 Integration

- **Видео генерация**: Создание видео с помощью Google VEO3
- **Image-to-Video**: Преобразование изображений в видео
- **Real-time Progress**: Отслеживание прогресса генерации

### Specialized Chat Experience

- **Dedicated Interface**: Отдельный интерфейс для Gemini + VEO3
- **Optimized Prompts**: Специализированные промпты для лучшей работы
- **Tool Integration**: Полная поддержка всех AI инструментов

## Usage

### Accessing Gemini Chat

1. **From Sidebar**: Нажмите кнопку "Gemini + VEO3" в сайдбаре
2. **Direct URL**: Перейдите на `/gemini-chat`
3. **Existing Chat**: Откройте существующий Gemini чат по `/gemini-chat/[id]`

### Features Available

- ✅ Текстовые ответы с Gemini 2.5 Flash Lite
- ✅ Генерация изображений
- ✅ Генерация видео с VEO3
- ✅ Создание документов
- ✅ Анализ и улучшение контента
- ✅ Мультимодальные вложения

## Technical Details

### API Endpoints

- `POST /api/gemini-chat` - Создание нового сообщения
- `GET /api/gemini-chat?chatId=[id]` - Получение существующего чата
- `DELETE /api/gemini-chat?id=[id]` - Удаление чата

### Model Configuration

```typescript
// Всегда использует Gemini 2.5 Flash Lite
model: myProvider.languageModel("gemini-2.5-flash-lite");

// Специализированный системный промпт
system: geminiSystemPrompt;
```

### Error Handling

- Graceful fallback при отсутствии API ключа
- Подробные ошибки в development режиме
- Автоматическое восстановление при сбоях

## Testing

### Manual Testing

1. Убедитесь, что `GOOGLE_AI_API_KEY` установлен
2. Перейдите на `/gemini-chat`
3. Отправьте тестовое сообщение
4. Проверьте генерацию изображений/видео

### Test Scenarios

- [ ] Базовое текстовое взаимодействие
- [ ] Генерация изображений
- [ ] Генерация видео с VEO3
- [ ] Создание документов
- [ ] Мультимодальные вложения
- [ ] Обработка ошибок

## Future Enhancements

- [ ] Поддержка других Gemini моделей
- [ ] Специализированные промпты для разных задач
- [ ] Интеграция с другими Google AI сервисами
- [ ] Оптимизация производительности
- [ ] Расширенная аналитика использования

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Убедитесь, что `GOOGLE_AI_API_KEY` установлен в `.env.local`
   - Перезапустите сервер разработки

2. **Model Not Available**
   - Проверьте, что модель `gemini-2.5-flash-lite` доступна в вашем регионе
   - Убедитесь в правильности API ключа

3. **Rate Limiting**
   - Gemini имеет ограничения по запросам
   - Проверьте квоты в Google AI Studio

### Debug Mode

Включите подробные логи:

```typescript
// В development режиме будут показаны детальные ошибки
console.log("🔍 Gemini chat request:", requestData);
```

## Related Documentation

- [AI Models Configuration](../architecture/ai-models.md)
- [API Integration Guide](../api-integration/README.md)
- [Video Generation with VEO3](../ai-capabilities/video-generation.md)

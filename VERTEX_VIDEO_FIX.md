# Vertex AI Video Generation Fix

## Проблемы и решения

### Проблема 1: Ошибка валидации duration
**Ошибка:** `Invalid enum value. Expected '4' | '6' | '8', received '8s'`

**Причина:**
- Fal.ai API ожидает `'4s' | '6s' | '8s'` (с суффиксом)
- Vertex AI API ожидает `'4' | '6' | '8'` (без суффикса)
- Клиент отправлял одинаковый формат для всех провайдеров

**Решение:**
Добавлена логика условного форматирования в `video-generation-api.ts`:
```typescript
const durationValue = request.duration || 8;
const duration = model.startsWith('vertex-')
  ? String(durationValue)  // Vertex: '4', '6', '8'
  : `${durationValue}s`;   // Fal.ai: '4s', '6s', '8s'
```

### Проблема 2: Пустой URL видео
**Ошибка:** Видео не отображается, URL пустой

**Причина:**
- Vertex AI использует асинхронную генерацию
- API возвращает `operationName`, но не готовый `videoUrl`
- Нужно опрашивать статус операции для получения URL

**Решение:**

1. **Создан новый endpoint** `/api/video/check-vertex/route.ts`:
   - Проверяет статус операции Vertex AI
   - Извлекает URL из структуры: `response.generateVideoResponse.generatedSamples[0].video.uri`
   - Возвращает URL видео когда готово

2. **Добавлен polling в клиенте** `video-generation-api.ts`:
   - Автоматически опрашивает статус для Vertex моделей
   - Максимум 12 попыток с интервалом 5 секунд (60 сек общего таймаута)
   - Показывает прогресс в UI

3. **Улучшен UX** в `use-video-generation.ts`:
   - Показывает статус "Waiting for completion..."
   - Обновляет прогресс во время polling

### Проблема 3: Неправильный путь извлечения URL
**Ошибка:** `Operation completed but no video URL found`

**Причина:**
- Vertex AI возвращает URL в структуре: `response.generateVideoResponse.generatedSamples[0].video.uri`
- Код искал по неправильному пути: `response.video.uri`

**Решение:**
Исправлен путь извлечения URL с поддержкой всех возможных структур:
```typescript
const videoUrl =
  operationData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
  operationData.response?.video?.uri ||
  operationData.response?.videoUri ||
  operationData.response?.url ||
  null;
```

### Проблема 4: Ошибка 403 при доступе к видео
**Ошибка:** `PERMISSION_DENIED` при попытке открыть видео по прямой ссылке

**Причина:**
- URL видео от Vertex AI требует аутентификации с API ключом
- Нельзя отправлять API ключ на клиент
- Прямой доступ без ключа возвращает 403

**Решение:**
Создан прокси-endpoint `/api/video/proxy-vertex`:
- Получает защищённый URL от клиента
- Скачивает видео с сервера Google с API ключом
- Отдаёт видео клиенту без раскрытия API ключа
- Клиент использует прокси URL вместо прямого: `/api/video/proxy-vertex?url=...`

## Файлы изменены

1. `apps/super-chatbot/src/app/tools/video-generation/api/video-generation-api.ts`
   - Условное форматирование duration
   - Polling логика для Vertex AI
   - Использование прокси URL для видео

2. `apps/super-chatbot/src/app/api/video/check-vertex/route.ts` (новый)
   - Endpoint для проверки статуса операции
   - Правильное извлечение URL из ответа

3. `apps/super-chatbot/src/app/api/video/proxy-vertex/route.ts` (новый)
   - Прокси для скачивания видео с аутентификацией
   - Стриминг видео клиенту

4. `apps/super-chatbot/src/app/tools/video-generation/hooks/use-video-generation.ts`
   - Улучшенные статусные сообщения

## Как работает

### Fal.ai (fal-veo3):
1. Клиент → POST /api/video/generate
2. Fal.ai возвращает готовый URL сразу
3. Видео отображается немедленно

### Vertex AI (vertex-veo2, vertex-veo3):
1. Клиент → POST /api/video/generate-vertex
2. Vertex возвращает `operationName`
3. Клиент начинает polling:
   - POST /api/video/check-vertex каждые 5 сек
   - Максимум 60 секунд ожидания
4. Когда `done: true`, получаем защищённый `videoUrl`
5. Клиент создаёт прокси URL: `/api/video/proxy-vertex?url=...`
6. При воспроизведении видео:
   - Браузер → GET /api/video/proxy-vertex
   - Сервер → GET к Google с API ключом
   - Сервер → Стриминг видео браузеру
7. Видео отображается

## Тестирование

Проверьте все 3 модели:
- ✅ fal-veo3 - должно работать сразу
- ✅ vertex-veo3 - должно работать после polling
- ✅ vertex-veo2 - должно работать после polling

Ожидаемое поведение:
1. Форма отправляется
2. Показывается статус "Processing..."
3. Для Vertex моделей - дополнительный статус "Waiting for completion..."
4. Видео появляется через 10-60 секунд

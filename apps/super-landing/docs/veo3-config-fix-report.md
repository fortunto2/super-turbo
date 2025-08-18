# VEO3 Configuration Fix Report

## Проблема

В логах было обнаружено, что для VEO3 инструмента отправляется запрос с `generation_config_name: 'google-cloud/veo3'`, но в ответе от SuperDuperAI API приходит `type: 'image_to_video'` вместо ожидаемого `text_to_video`.

## Причина

Использовался неправильный конфиг модели:

- **Неправильно**: `google-cloud/veo3` - предназначен для image-to-video
- **Правильно**: `google-cloud/veo3-text2video` - предназначен для text-to-video

## Исправленные файлы

### 1. API Routes

- `src/app/api/generate-veo3/route.ts` - основной API для генерации VEO3
- `src/app/api/webhooks/stripe/route.ts` - webhook обработчик Stripe

### 2. Скрипты

- `scripts/redis-session-debug.js` - отладочный скрипт

### 3. Документация

- `docs/superduperai-integration.md` - документация интеграции
- `docs/payment/veo3-payment-flow.md` - документация платежного потока

## Изменения

Во всех файлах заменил:

```typescript
generation_config_name: "google-cloud/veo3";
```

На:

```typescript
generation_config_name: "google-cloud/veo3-text2video";
```

## Результат

Теперь VEO3 инструмент будет корректно использовать text-to-video модель вместо image-to-video, что соответствует ожидаемому поведению для генерации видео из текстового промпта.

## Проверка

После внесения изменений:

1. Перезапустите сервер разработки
2. Протестируйте генерацию VEO3 видео
3. Проверьте логи - теперь должен приходить `type: 'text_to_video'` в ответе API


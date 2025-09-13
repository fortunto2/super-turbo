# Simple Token Management

Простая система кэширования и автоматического добавления токена SuperDuperAI к запросам.

## Проблема

- Каждый API запрос читал токен из env переменных
- Отсутствовало кэширование токена
- Нужно было вручную добавлять токен к каждому запросу

## Решение

Создана простая система с двумя компонентами:

### 1. Token Cache (`token-cache.ts`)

```typescript
import { getSuperduperToken } from "@/lib/config/token-cache";

// Получить кэшированный токен (читается из env только один раз в 30 минут)
const token = getSuperduperToken();
```

### 2. Fetch Interceptor (`simple-fetch-interceptor.ts`)

Автоматически:

- На сервере: добавляет токен к запросам SuperDuperAI
- На клиенте: перенаправляет запросы через прокси

## Как работает

### На сервере:

```typescript
// Запрос автоматически получает токен
const response = await fetch("/api/v1/some-endpoint", {
  method: "POST",
  body: JSON.stringify(data),
});
// Интерцептор добавляет: Authorization: Bearer YOUR_TOKEN
```

### На клиенте:

```typescript
// Запрос автоматически перенаправляется через прокси
const response = await fetch("/api/v1/some-endpoint", {
  method: "POST",
  body: JSON.stringify(data),
});
// Интерцептор перенаправляет на: /api/proxy/some-endpoint
```

## Настройка

Никаких изменений не требуется. Система автоматически использует:

```env
SUPERDUPERAI_TOKEN=your_token_here
```

Интерцепторы подключаются автоматически в `query-provider.tsx`.

## Преимущества

1. **Простота**: Всего 2 файла вместо сложной системы
2. **Кэширование**: Токен читается из env только раз в 30 минут
3. **Автоматизация**: Токен добавляется ко всем запросам SuperDuperAI автоматически
4. **Прозрачность**: Работает с существующим кодом без изменений

## Файлы

- `lib/config/token-cache.ts` - кэширование токена
- `lib/api/simple-fetch-interceptor.ts` - автоматическое добавление токена
- `lib/api/axios-interceptor.ts` - упрощен для работы только с прокси

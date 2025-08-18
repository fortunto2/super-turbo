# VEO3 Payment Flow Documentation

## Обзор процесса

Данная документация описывает полный процесс оплаты и получения файлов в VEO3 туле SuperDuperAI, включая все этапы от создания заказа до скачивания готового видео.

## Архитектура системы

### Компоненты системы:

- **Frontend**: Next.js 15 с React 19
- **Backend**: Next.js API Routes
- **Payment**: Stripe Checkout
- **Storage**: Redis (Cloudflare KV) для сессий
- **AI Generation**: SuperDuperAI API (VEO3 model)
- **File Storage**: SuperDuperAI CDN

### Ключевые файлы:

- `src/app/api/create-checkout/route.ts` - создание Stripe сессии
- `src/app/api/webhooks/stripe/route.ts` - обработка webhook'ов
- `src/app/api/webhook-status/[sessionId]/route.ts` - проверка статуса
- `src/app/api/file/[id]/route.ts` - получение файла
- `src/components/payment/payment-success-client.tsx` - страница успешной оплаты
- `src/components/file/file-status-client.tsx` - статус файла

## Процесс оплаты (ДО оплаты)

### 1. Создание заказа

**Файл**: `src/app/api/create-checkout/route.ts`

```typescript
// Пользователь заполняет форму с промптом и количеством видео
// Система создает Stripe checkout сессию
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: quantity }],
  mode: "payment",
  success_url: `${appUrl}/en/payment-success/{CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/en/tool/veo3-prompt-generator`,
  metadata: { video_count: quantity.toString(), tool: "veo3-generator" },
});
```

### 2. Сохранение данных сессии

**Хранилище**: Redis (Cloudflare KV)

```typescript
// Все данные сохраняются в Redis, а не в Stripe metadata
const sessionData: SessionData = {
  prompt: prompt || "",
  videoCount: quantity,
  duration: 8,
  resolution: "1280x720",
  style: "cinematic",
  toolSlug: toolSlug || "veo3-prompt-generator",
  toolTitle: toolTitle || "Free VEO3 Viral Prompt Generator",
  createdAt: new Date().toISOString(),
  status: "pending",
};

await storeSessionData(session.id, sessionData);
```

### 3. Редирект на Stripe

- Пользователь перенаправляется на Stripe Checkout
- URL: `https://checkout.stripe.com/pay/cs_xxx...`
- Время ожидания: до завершения оплаты

## Процесс обработки платежа

### 4. Webhook обработка

**Файл**: `src/app/api/webhooks/stripe/route.ts`

#### События Stripe:

- `checkout.session.completed` - завершение checkout
- `payment_intent.succeeded` - успешная оплата
- `payment_intent.payment_failed` - неудачная оплата

#### Обработка успешного платежа:

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // 1. Получение данных сессии из Redis
  const sessionData = await getSessionData(session.id);

  // 2. Обновление статуса на 'processing'
  await updateSessionData(session.id, { status: "processing" });

  // 3. Запуск генерации видео через SuperDuperAI
  const fileId = await generateVideoWithSuperDuperAI(
    sessionData.prompt,
    sessionData.duration,
    sessionData.resolution,
    sessionData.style
  );

  // 4. Сохранение fileId в сессии
  await updateSessionData(session.id, {
    status: "processing",
    fileId,
  });
}
```

### 5. Генерация видео

**API**: SuperDuperAI VEO3 Model

```typescript
const payload = {
  config: {
    prompt: sessionData.prompt,
    negative_prompt: "",
    width: 1280,
    height: 720,
    aspect_ratio: "16:9",
    duration: 8,
    seed: Math.floor(Math.random() * 1000000),
    generation_config_name: "google-cloud/veo3-text2video",
    frame_rate: 30,
    batch_size: 1,
    references: [],
  },
};

const response = await fetch(`${config.url}/api/v1/file/generate-video`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  },
  body: JSON.stringify(payload),
});

const result = await response.json();
const fileId = result.id; // UUID файла в SuperDuperAI
```

## Процесс после оплаты

### 6. Страница успешной оплаты

**URL**: `/en/payment-success/{CHECKOUT_SESSION_ID}`
**Файл**: `src/components/payment/payment-success-client.tsx`

#### Логика работы:

1. **Проверка статуса webhook** каждые 2 секунды
2. **Ожидание fileId** от webhook'а
3. **Автоматический редирект** на страницу файла при получении fileId
4. **Таймаут** через 60 секунд с fallback опциями

```typescript
// Polling статуса webhook
const checkWebhookStatus = async () => {
  const response = await fetch(`/api/webhook-status/${sessionId}`);
  const data = await response.json();

  if (data.fileId && data.status !== "error") {
    // Редирект на страницу файла
    router.push(`/${locale}/file/${data.fileId}`);
  }
};

// Автоматический polling каждые 2 секунды
useEffect(() => {
  const interval = setInterval(checkWebhookStatus, 2000);
  return () => clearInterval(interval);
}, []);
```

### 7. Страница статуса файла

**URL**: `/en/file/{fileId}`
**Файл**: `src/components/file/file-status-client.tsx`

#### Функциональность:

- **Отображение прогресса** генерации
- **Автообновление** каждые 5 секунд
- **Предпросмотр** готового видео
- **Скачивание** файла
- **Копирование** URL

```typescript
// Получение статуса файла
const fetchFileStatus = async () => {
  const response = await fetch(`/api/file/${fileId}`);
  const data = await response.json();
  setFileData(data);
};

// Автообновление для активных задач
useEffect(() => {
  if (fileData?.tasks.some((task) => task.status === "in_progress")) {
    const interval = setInterval(fetchFileStatus, 5000);
    return () => clearInterval(interval);
  }
}, [fileData]);
```

## API Endpoints

### 1. Создание checkout сессии

```
POST /api/create-checkout
Body: { priceId, quantity, prompt, toolSlug, toolTitle }
Response: { sessionId, url }
```

### 2. Проверка статуса webhook

```
GET /api/webhook-status/{sessionId}
Response: { status, fileId, error, toolSlug, toolTitle, prompt }
```

### 3. Получение файла

```
GET /api/file/{fileId}
Response: { id, url, thumbnail_url, type, tasks, video_generation, ... }
```

### 4. Webhook Stripe

```
POST /api/webhooks/stripe
Headers: { 'stripe-signature': '...' }
Body: Stripe webhook payload
```

## Статусы процесса

### Статусы сессии (Redis):

- `pending` - ожидание оплаты
- `processing` - генерация видео
- `completed` - видео готово
- `error` - ошибка

### Статусы файла (SuperDuperAI):

- `pending` - задача в очереди
- `in_progress` - генерация
- `completed` - готово
- `failed` - ошибка

## Обработка ошибок

### 1. Ошибки оплаты

- **Неудачная оплата**: редирект на cancel_url
- **Webhook ошибки**: логирование + уведомления

### 2. Ошибки генерации

- **API ошибки**: сохранение в статус 'error'
- **Таймауты**: 15 секунд для webhook, 60 секунд для UI

### 3. Fallback механизмы

- **Ручной поиск файла**: `/en/session/{sessionId}`
- **Просмотр всех файлов**: `/en/dev/files` (dev режим)
- **Копирование sessionId**: для поддержки

## Безопасность

### 1. Валидация данных

- **Stripe signature verification** для webhook'ов
- **UUID validation** для fileId
- **Session ID format** проверка (cs_xxx)

### 2. Ограничения

- **Таймауты** на все API вызовы
- **Rate limiting** на polling
- **CORS** настройки

### 3. Логирование

- **Все API вызовы** логируются
- **Webhook события** детально отслеживаются
- **Ошибки** с контекстом

## Мониторинг и отладка

### 1. Логи

```bash
# Проверка webhook событий
grep "Stripe webhook event" logs

# Проверка генерации видео
grep "SuperDuperAI video generation" logs

# Проверка ошибок
grep "❌" logs
```

### 2. Redis данные

```bash
# Проверка сессии
redis-cli get "session:cs_xxx"

# Список всех сессий
redis-cli keys "session:*"
```

### 3. SuperDuperAI статус

```bash
# Проверка файла
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.superduperai.com/api/v1/file/{fileId}"
```

## Время выполнения

### Типичные временные рамки:

1. **Оплата**: 10-30 секунд
2. **Webhook обработка**: 5-15 секунд
3. **Генерация видео**: 2-5 минут
4. **Общий процесс**: 3-6 минут

### Критические точки:

- **Webhook timeout**: 15 секунд
- **UI polling timeout**: 60 секунд
- **Video generation**: до 10 минут (максимум)

## Рекомендации по улучшению

### 1. Производительность

- **Кэширование** статусов файлов
- **WebSocket** для real-time обновлений
- **CDN** для статических ресурсов

### 2. UX улучшения

- **Progress bar** с реальным прогрессом
- **Email уведомления** при готовности
- **Push notifications** в браузере

### 3. Мониторинг

- **Metrics** для всех этапов
- **Alerting** при ошибках
- **Dashboard** для администраторов

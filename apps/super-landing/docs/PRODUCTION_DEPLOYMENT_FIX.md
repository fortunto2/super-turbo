# 🔧 Исправление ошибки билда на продакшене

## Проблема

При деплое на продакшен возникает ошибка из-за отсутствующих переменных окружения:

```
[warn]   - DATABASE_URL
[warn]   - DATABASE_URL_UNPOOLED
[warn]   - PGHOST
[warn]   - PGHOST_UNPOOLED
[warn]   - PGUSER
[warn]   - PGDATABASE
[warn]   - PGPASSWORD
[warn]   - REDIS_URL
```

## ✅ Что уже исправлено

### 1. Redis Fallback

- Добавлен fallback URL для Redis в `src/lib/kv.ts`
- Все функции Redis теперь корректно обрабатывают отсутствие подключения
- Приложение будет работать без Redis (с предупреждениями в логах)

### 2. Azure OpenAI Fallback

- Добавлены fallback значения для Azure OpenAI переменных
- Улучшена проверка переменных окружения

### 3. Stripe Fallback

- Добавлены fallback значения для Stripe переменных
- Улучшена обработка ошибок

## 🚀 Как исправить для продакшена

### Вариант 1: Добавить переменные окружения (Рекомендуется)

1. **В Vercel Dashboard:**
   - Перейдите в Project Settings → Environment Variables
   - Добавьте следующие переменные:

```
AZURE_OPENAI_RESOURCE_NAME=your-actual-resource-name
AZURE_OPENAI_API_KEY=your-actual-api-key
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
SUPERDUPERAI_TOKEN=your_actual_superduperai_token
REDIS_URL=redis://your-actual-redis-url
```

2. **В Cloudflare (если используете):**
   - Добавьте переменные в `wrangler.toml`:

```toml
[vars]
AZURE_OPENAI_RESOURCE_NAME = "your-actual-resource-name"
AZURE_OPENAI_API_KEY = "your-actual-api-key"
STRIPE_SECRET_KEY = "sk_live_your_actual_stripe_key"
STRIPE_WEBHOOK_SECRET = "whsec_your_actual_webhook_secret"
SUPERDUPERAI_TOKEN = "your_actual_superduperai_token"
REDIS_URL = "redis://your-actual-redis-url"
```

### Вариант 2: Временное решение (без Redis)

Если Redis не критичен для работы приложения:

1. **Установите только обязательные переменные:**

```
AZURE_OPENAI_RESOURCE_NAME=your-actual-resource-name
AZURE_OPENAI_API_KEY=your-actual-api-key
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
SUPERDUPERAI_TOKEN=your_actual_superduperai_token
```

2. **Redis будет использовать fallback URL** (из скриптов)

## 🔍 Проверка переменных окружения

Запустите скрипт для проверки:

```bash
cd apps/super-landing
pnpm run check-env
```

Этот скрипт покажет:

- ✅ Какие переменные установлены
- ❌ Какие переменные отсутствуют
- ⚠️ Какие переменные используют placeholder значения

## 📋 Список всех переменных окружения

### Обязательные:

- `AZURE_OPENAI_RESOURCE_NAME` - Azure OpenAI resource name
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key (live mode для продакшена)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SUPERDUPERAI_TOKEN` - SuperDuperAI API token

### Опциональные:

- `REDIS_URL` - Redis connection URL (есть fallback)
- `NEXT_PUBLIC_SITE_URL` - Site URL для SEO
- `NEXT_PUBLIC_APP_URL` - App URL для webhooks
- `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` - Google Tag Manager ID
- `LANGCHAIN_API_KEY` - LangSmith API key для трейсинга

## 🎯 Результат

После исправления:

- ✅ Билд будет проходить успешно
- ✅ Приложение будет работать на продакшене
- ⚠️ Redis функции будут использовать fallback (с предупреждениями)
- 🔧 Можно будет постепенно настроить Redis позже

## 📞 Поддержка

Если проблема остается:

1. Проверьте логи билда
2. Убедитесь, что все переменные установлены правильно
3. Проверьте, что переменные не содержат placeholder значения

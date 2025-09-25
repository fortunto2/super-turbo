# Руководство по развертыванию Super Turbo

## Обзор

Данное руководство описывает процесс развертывания приложения Super Turbo на различных платформах с настройкой всех необходимых сервисов и интеграций.

## Предварительные требования

### 1. API ключи и сервисы

#### SuperDuperAI

- Зарегистрируйтесь на [SuperDuperAI](https://superduperai.com)
- Получите API ключ для генерации изображений и видео
- Настройте webhook для получения уведомлений

#### Аутентификация

- **NextAuth**: Сгенерируйте `AUTH_SECRET` с помощью [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
- **Auth0** (опционально): Настройте приложение в Auth0

#### Платежи

- **Stripe**: Создайте аккаунт и получите ключи API
- Настройте webhook для обработки платежей

#### Мониторинг

- **Sentry**: Создайте проект и получите DSN
- **Slack** (опционально): Настройте webhook для алертов

### 2. База данных

#### Vercel Postgres (рекомендуется)

- Создайте базу данных в Vercel
- Получите строку подключения

#### Альтернативы

- **Neon**: Serverless PostgreSQL
- **Supabase**: PostgreSQL с дополнительными функциями
- **PlanetScale**: MySQL совместимая база данных

### 3. Хранилище файлов

#### Vercel Blob (рекомендуется)

- Включите Vercel Blob в настройках проекта
- Получите токен доступа

#### Альтернативы

- **AWS S3**: Настройте bucket и IAM пользователя
- **Cloudflare R2**: Совместимое с S3 хранилище
- **Google Cloud Storage**: Альтернативное решение

## Развертывание на Vercel

### 1. Подготовка репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/super-turbo.git
cd super-turbo

# Установите зависимости
pnpm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local`:

```bash
# Аутентификация
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# SuperDuperAI
SUPERDUPERAI_TOKEN=your-superduperai-token
SUPERDUPERAI_API_URL=https://api.superduperai.com

# База данных
DATABASE_URL=postgresql://username:password@host:port/database

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-blob-token

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Мониторинг (опционально)
LOG_LEVEL=info
LOG_REMOTE_ENDPOINT=https://logs.example.com/api
LOG_REMOTE_TOKEN=your-log-token
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_WEBHOOK_TOKEN=your-webhook-token
```

### 3. Развертывание

#### Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Разверните проект
vercel

# Настройте переменные окружения
vercel env add AUTH_SECRET
vercel env add SUPERDUPERAI_TOKEN
# ... добавьте все необходимые переменные
```

#### Через веб-интерфейс

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в настройках проекта
3. Запустите развертывание

### 4. Настройка базы данных

#### Миграции

```bash
# Запустите миграции
pnpm db:migrate

# Или через Vercel CLI
vercel env pull
pnpm db:migrate
```

#### Схема базы данных

```sql
-- Основные таблицы
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавьте остальные таблицы согласно схеме
```

## Развертывание на других платформах

### 1. Railway

#### Настройка

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в аккаунт
railway login

# Создайте проект
railway init

# Добавьте переменные окружения
railway variables set AUTH_SECRET=your-secret
railway variables set DATABASE_URL=postgresql://...
```

#### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 2. Render

#### Настройка

1. Подключите репозиторий
2. Выберите "Web Service"
3. Настройте переменные окружения
4. Укажите команды сборки и запуска

#### Команды

- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`

### 3. DigitalOcean App Platform

#### Настройка

1. Создайте новое приложение
2. Подключите репозиторий
3. Настройте переменные окружения
4. Выберите план и регион

#### Конфигурация

```yaml
name: super-turbo
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/super-turbo
      branch: main
    run_command: pnpm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: AUTH_SECRET
        value: your-secret
      - key: DATABASE_URL
        value: postgresql://...
```

## Настройка мониторинга

### 1. Sentry

#### Настройка проекта

1. Создайте проект в Sentry
2. Получите DSN
3. Настройте релизы и деплои

#### Конфигурация

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

### 2. Slack интеграция

#### Настройка webhook

1. Создайте приложение в Slack
2. Включите Incoming Webhooks
3. Создайте webhook URL
4. Добавьте в переменные окружения

#### Тестирование

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test alert from Super Turbo"}' \
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. Prometheus + Grafana

#### Настройка Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "super-turbo"
    static_configs:
      - targets: ["your-app.vercel.app:443"]
    metrics_path: "/api/metrics"
    params:
      format: ["prometheus"]
```

#### Настройка Grafana

1. Импортируйте дашборд
2. Настройте источник данных Prometheus
3. Добавьте алерты

## Проверка развертывания

### 1. Health Check

```bash
curl https://your-app.vercel.app/api/health
```

### 2. Метрики

```bash
curl https://your-app.vercel.app/api/metrics
```

### 3. Функциональность

1. Откройте приложение в браузере
2. Проверьте аутентификацию
3. Протестируйте генерацию контента
4. Проверьте админ панель

## Обслуживание

### 1. Мониторинг

- Регулярно проверяйте дашборды мониторинга
- Настройте алерты для критических метрик
- Отслеживайте использование ресурсов

### 2. Обновления

- Регулярно обновляйте зависимости
- Тестируйте изменения в staging окружении
- Используйте feature flags для безопасных развертываний

### 3. Резервное копирование

- Настройте автоматическое резервное копирование БД
- Регулярно экспортируйте конфигурации
- Документируйте изменения

## Устранение неполадок

### 1. Частые проблемы

#### Ошибки аутентификации

- Проверьте `AUTH_SECRET`
- Убедитесь в правильности `NEXTAUTH_URL`
- Проверьте настройки провайдера

#### Проблемы с БД

- Проверьте строку подключения
- Убедитесь в доступности БД
- Проверьте миграции

#### Ошибки AI генерации

- Проверьте API ключи
- Убедитесь в наличии кредитов
- Проверьте лимиты rate limiting

### 2. Логи и отладка

#### Просмотр логов

```bash
# Vercel
vercel logs

# Railway
railway logs

# Render
# Используйте веб-интерфейс
```

#### Отладка в Sentry

1. Откройте проект в Sentry
2. Проверьте Issues и Performance
3. Настройте алерты для новых ошибок

## Безопасность

### 1. Переменные окружения

- Никогда не коммитьте `.env` файлы
- Используйте разные секреты для разных окружений
- Регулярно ротируйте ключи

### 2. Сетевая безопасность

- Настройте CORS правильно
- Используйте HTTPS везде
- Настройте rate limiting

### 3. Мониторинг безопасности

- Отслеживайте подозрительную активность
- Настройте алерты для аномалий
- Регулярно обновляйте зависимости

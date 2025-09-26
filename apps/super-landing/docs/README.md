# Super Landing - Документация

Многоязычный маркетинговый сайт для SuperDuperAI с интеграцией AI генерации контента.

## 🚀 Быстрый старт

### Установка

```bash
# Переход в папку приложения
cd apps/super-landing

# Установка зависимостей
pnpm install

# Настройка переменных окружения
cp .env.example .env.local
```

### Запуск

```bash
# Режим разработки
pnpm dev

# Сборка
pnpm build

# Предварительный просмотр
pnpm preview
```

## 🌐 Многоязычность

### Поддерживаемые языки

- **Русский** (ru) - основной язык
- **Английский** (en) - международный
- **Турецкий** (tr) - региональный
- **Испанский** (es) - латиноамериканский
- **Хинди** (hi) - азиатский рынок

### Структура переводов

```
src/config/dictionaries/
├── ru.json          # Русский
├── en.json          # Английский
├── tr.json          # Турецкий
├── es.json          # Испанский
└── hi.json          # Хинди
```

### Использование переводов

```typescript
import { useTranslation } from "@/hooks/use-translation";

export function MyComponent() {
  const { t } = useTranslation("ru");

  return <h1>{t("hero.title")}</h1>;
}
```

## 🎨 UI Компоненты

### Использование общих компонентов

```typescript
import { Button, Card, Input } from "@turbo-super/ui";

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Введите текст" />
      <Button variant="accent">Отправить</Button>
    </Card>
  );
}
```

### Специфичные компоненты

- `OptimizedLink` - оптимизированные ссылки
- `AnalyticsProviders` - провайдеры аналитики
- `SafeIcon` - безопасные иконки
- `CodeBlock` - блоки кода

## 📄 Контент-менеджмент

### ContentLayer2

Сайт использует ContentLayer2 для управления MDX контентом:

```typescript
// contentlayer.config.ts
export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [Tool, Case, Doc, Page, Home, Blog],
});
```

### Структура контента

```
src/content/
├── blog/              # Блог посты
│   ├── ru/           # Русские посты
│   ├── en/           # Английские посты
│   └── ...
├── tool/              # Инструменты
├── case/              # Кейсы
└── pages/             # Статические страницы
```

### MDX файлы

```mdx
---
title: "Заголовок"
description: "Описание"
locale: "ru"
seo:
  title: "SEO заголовок"
  description: "SEO описание"
---

# Заголовок

Контент страницы...
```

## 🤖 AI Интеграция

### SuperDuperAI API

Интеграция с SuperDuperAI для генерации контента:

```typescript
// Генерация изображений
const response = await fetch("/api/generate-model-image", {
  method: "POST",
  body: JSON.stringify({
    prompt: "красивый закат",
    model: "google-cloud/imagen4",
    count: 1,
  }),
});

// Генерация видео
const response = await fetch("/api/generate-model-video", {
  method: "POST",
  body: JSON.stringify({
    prompt: "анимированный логотип",
    model: "azure-openai/sora",
    count: 1,
  }),
});
```

### Поддерживаемые модели

#### Изображения

- **Google Imagen 4** - высококачественные изображения
- **GPT-Image-1** - OpenAI изображения
- **Flux Kontext** - контекстные изображения

#### Видео

- **Sora** - OpenAI видео генерация
- **Veo2** - Google видео
- **Veo3** - новейшая Google модель

## 💳 Платежная система

### Stripe интеграция

```typescript
import { StripePaymentButton } from "@/components/ui/stripe-payment-button";

export function PaymentSection() {
  return (
    <StripePaymentButton
      amount={1000}
      currency="usd"
      description="Пополнение баланса"
    />
  );
}
```

### Конфигурация платежей

```typescript
// stripe.config.ts
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};
```

## 🔍 SEO оптимизация

### Мета-теги

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "SuperDuperAI - AI генерация контента",
  description: "Создавайте изображения и видео с помощью AI",
  keywords: ["AI", "генерация", "изображения", "видео"],
};
```

### Open Graph

```typescript
export const metadata: Metadata = {
  openGraph: {
    title: "SuperDuperAI",
    description: "AI генерация контента",
    images: ["/og-image.jpg"],
  },
};
```

### Структурированные данные

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SuperDuperAI",
  description: "AI генерация контента",
};
```

## 📊 Аналитика

### Google Analytics 4

```typescript
// components/analytics-providers.tsx
export function AnalyticsProviders() {
  return (
    <>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      <GoogleTagManager gtmId="GTM-XXXXXXX" />
    </>
  );
}
```

### События

```typescript
// Отправка события
gtag("event", "purchase", {
  transaction_id: "12345",
  value: 10.0,
  currency: "USD",
});
```

## 🚀 Деплой

### Vercel

```bash
# Автоматический деплой
git push origin main

# Ручной деплой
vercel --prod
```

### Переменные окружения

```bash
# Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPERDUPERAI_API_URL=https://api.superduperai.com
SUPERDUPERAI_API_KEY=your_api_key
```

## 🛠️ Разработка

### Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Локализованные маршруты
│   ├── api/               # API маршруты
│   └── globals.css        # Глобальные стили
├── components/             # React компоненты
│   ├── content/           # Контентные компоненты
│   ├── landing/           # Лендинг компоненты
│   └── ui/                # UI компоненты
├── config/                # Конфигурация
│   └── dictionaries/      # Переводы
├── content/               # MDX контент
├── hooks/                 # React хуки
├── lib/                   # Утилиты
└── types/                 # TypeScript типы
```

### Команды разработки

```bash
# Линтинг
pnpm lint

# Форматирование
pnpm format

# Проверка типов
pnpm type-check

# Сборка
pnpm build

# Предварительный просмотр
pnpm preview
```

## 🐛 Отладка

### Частые проблемы

#### Проблемы с переводами

```bash
# Проверка структуры JSON
pnpm validate-translations

# Генерация типов
pnpm generate-translation-types
```

#### Проблемы с ContentLayer

```bash
# Очистка кэша
rm -rf .contentlayer
pnpm dev
```

#### Проблемы с AI API

- Проверьте переменные окружения
- Убедитесь в правильности API ключей
- Проверьте лимиты API

## 📚 Дополнительные ресурсы

### 🏗️ Основные разделы

- [**Архитектура сайта**](./ARCHITECTURE.md) - Техническая архитектура, компоненты и деплой
- [**SEO оптимизация**](./SEO.md) - Многоязычное SEO, мета-теги и производительность

### 🔧 Детальная документация

- [Архитектура](./architecture/) - Детальная техническая архитектура
- [SEO](./seo/) - Детальная SEO документация
- [Задачи](./tasks/) - Список задач проекта
- [Troubleshooting](./troubleshooting/) - Решение проблем

---

**Версия**: 2025-01-27  
**Статус**: Активная разработка  
**Последнее обновление**: 27 января 2025

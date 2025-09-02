# @turbo-super/payment

Пакет для обработки платежей в turbo-super проекте.

## Описание

Этот пакет содержит все компоненты и логику, связанную с платежами:

- Компоненты для Stripe интеграции
- Хуки для работы с ценами и конфигурацией
- Логика создания checkout сессий

## Структура

```
src/
├── components/          # UI компоненты для платежей
│   ├── stripe-payment-button.tsx
│   └── index.ts
├── hooks/              # React хуки для платежей
│   ├── use-stripe-prices.ts
│   └── index.ts
└── index.ts            # Главный экспорт
```

## Компоненты

### StripePaymentButton

Основной компонент для создания платежных кнопок с поддержкой:

- Генерации видео (VEO3)
- Генерации изображений
- Пополнения баланса кредитами

#### Props

```typescript
interface StripePaymentButtonProps {
  prompt?: string; // Промпт для генерации
  variant?: "video" | "credits" | "image"; // Тип платежа
  price?: number; // Цена
  creditAmount?: number; // Количество кредитов
  apiEndpoint?: string; // API для получения цен
  checkoutEndpoint?: string; // API для создания checkout
  locale?: string; // Локаль
  generationType?: string; // Тип генерации
  imageFile?: File | null; // Файл изображения
  modelName?: string; // Название модели
}
```

## Хуки

### useStripePrices

Хук для получения цен Stripe:

```typescript
const { prices, mode, loading, error } = useStripePrices(apiEndpoint);
```

### useStripeConfig

Хук для получения конфигурации Stripe:

```typescript
const config = useStripeConfig(apiEndpoint);
```

## Зависимости

- `@turbo-super/shared` - Общие типы и утилиты
- `@turbo-super/ui` - Базовые UI компоненты
- `sonner` - Уведомления

## Использование

```typescript
import { StripePaymentButton } from "@turbo-super/payment";

<StripePaymentButton
  variant="video"
  price={1.0}
  toolSlug="veo3-generator"
  toolTitle="VEO3 Video Generator"
  locale="en"
/>
```

## Разработка

```bash
# Установка зависимостей
pnpm install

# Разработка с watch режимом
pnpm dev

# Сборка
pnpm build

# Проверка типов
pnpm type-check

# Линтинг
pnpm lint
```

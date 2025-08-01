# Платежная система Stripe

Общие компоненты для интеграции платежей Stripe в приложения turbo-super.

## Компоненты

### StripePaymentButton

Универсальный компонент для создания кнопок оплаты Stripe.

```tsx
import { StripePaymentButton } from '@turbo-super/shared';

// Для пополнения баланса
<StripePaymentButton
  variant="credits"
  creditAmount={100}
  price={1.00}
  apiEndpoint="/api/stripe-prices"
  checkoutEndpoint="/api/create-checkout"
/>

// Для генерации видео
<StripePaymentButton
  prompt="Your video prompt"
  variant="video"
  toolSlug="veo3-generator"
  toolTitle="VEO3 Generator"
  price={1.00}
  apiEndpoint="/api/stripe-prices"
  checkoutEndpoint="/api/create-checkout"
/>
```

#### Props

- `variant`: `'video' | 'credits'` - Тип платежа
- `prompt?`: `string` - Промпт для генерации видео (только для variant="video")
- `creditAmount?`: `number` - Количество кредитов для пополнения (только для variant="credits")
- `price`: `number` - Цена в долларах
- `apiEndpoint`: `string` - API endpoint для получения цен
- `checkoutEndpoint`: `string` - API endpoint для создания checkout сессии
- `toolSlug?`: `string` - Слаг инструмента
- `toolTitle?`: `string` - Название инструмента
- `onPaymentClick?`: `() => void` - Callback при клике на оплату
- `className?`: `string` - CSS классы

### Хуки

#### useStripePrices

Хук для получения цен Stripe.

```tsx
import { useStripePrices } from '@turbo-super/shared';

const { prices, mode, loading, error } = useStripePrices('/api/stripe-prices');
```

#### useStripeConfig

Хук для получения полной конфигурации Stripe.

```tsx
import { useStripeConfig } from '@turbo-super/shared';

const config = useStripeConfig('/api/stripe-prices');
```

### Конфигурация

#### getStripeConfig

Функция для получения конфигурации Stripe.

```tsx
import { getStripeConfig } from '@turbo-super/shared';

const config = getStripeConfig();
// { prices: { single: 'price_...', triple: 'price_...' }, mode: 'test' | 'live' }
```

## API Endpoints

### GET /api/stripe-prices

Возвращает текущие цены Stripe.

```json
{
  "success": true,
  "prices": {
    "single": "price_1RktnoK9tHMoWhKim5uqXiAe",
    "triple": "price_1Rkto1K9tHMoWhKinvpEwntH"
  },
  "mode": "test"
}
```

### POST /api/create-checkout

Создает checkout сессию Stripe.

```json
{
  "priceId": "price_1RktnoK9tHMoWhKim5uqXiAe",
  "quantity": 1,
  "prompt": "Video prompt",
  "toolSlug": "veo3-generator",
  "toolTitle": "VEO3 Generator",
  "creditAmount": 100
}
```

## Webhook Handler

### POST /api/webhooks/stripe

Обрабатывает события Stripe webhook.

Поддерживаемые события:
- `checkout.session.completed` - Завершение checkout
- `payment_intent.succeeded` - Успешный платеж
- `payment_intent.payment_failed` - Неудачный платеж

## Интеграция в чатбот

1. Добавить кнопку пополнения в компонент баланса:

```tsx
<ToolsBalance
  variant="header"
  showTopUpButton={true}
/>
```

2. Создать API endpoints:
   - `/api/stripe-prices`
   - `/api/create-checkout`
   - `/api/webhooks/stripe`

3. Создать страницу успешной оплаты:
   - `/payment-success/[sessionId]`

## Интеграция в landing

1. Заменить существующий компонент на общий:

```tsx
import { StripePaymentButton } from '@turbo-super/shared';

export function Veo3PaymentButtons({ prompt, ...props }) {
  return (
    <StripePaymentButton
      prompt={prompt}
      variant="video"
      price={1.00}
      {...props}
    />
  );
}
```

## Переменные окружения

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..." # или sk_live_...
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # или pk_live_...

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000" # или https://yourdomain.com
```

## Цены

### Test Mode
- **Single Video**: $1.00 (`price_1RktnoK9tHMoWhKim5uqXiAe`)
- **Triple Pack**: $2.00 (`price_1Rkto1K9tHMoWhKinvpEwntH`)

### Production Mode
- **Single Video**: $1.00 (`price_1Rkse5K9tHMoWhKiQ0tg0b2N`)
- **Triple Pack**: $2.00 (`price_1Rkse7K9tHMoWhKise2iYOXL`)

Система автоматически определяет режим по префиксу `STRIPE_SECRET_KEY`. 
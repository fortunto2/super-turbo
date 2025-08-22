# @turbo-super/tailwind

Общий пакет для конфигурации Tailwind CSS в монорепозитории turbo-super.

## Установка

```bash
pnpm add @turbo-super/tailwind
```

## Использование

### 1. В Next.js приложениях

Обновите ваш `tailwind.config.js` или `tailwind.config.ts`:

```js
// tailwind.config.js
const { baseConfig } = require("@turbo-super/tailwind/config");

module.exports = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/features/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { baseConfig } from "@turbo-super/tailwind/config";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/features/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
```

### 2. Импорт CSS стилей

В вашем основном CSS файле (например, `globals.css`):

```css
@import "@turbo-super/tailwind/css";

/* Ваши дополнительные стили */
```

### 3. Импорт конфигурации программно

```ts
import { baseConfig } from "@turbo-super/tailwind/config";

// Используйте baseConfig для создания собственной конфигурации
const customConfig = {
  ...baseConfig,
  // Ваши настройки
};
```

## Особенности

- **Единая тема**: Общие цвета, шрифты и утилиты для всех проектов
- **Темная тема**: Поддержка CSS переменных для переключения темы
- **Компоненты**: Готовые CSS классы для кнопок, карточек и эффектов
- **Адаптивность**: Общие breakpoints и responsive утилиты

## Доступные CSS классы

- `.btn-accent` - Кнопки с акцентным цветом
- `.card-enhanced` - Улучшенные карточки с hover эффектами
- `.glassmorphism` - Стеклянный эффект
- `.gradient-border` - Градиентные границы
- `.neon-glow` - Неоновое свечение

## Разработка

```bash
# Сборка
pnpm build

# Разработка с watch режимом
pnpm dev

# Очистка
pnpm clean
```

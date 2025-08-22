# Миграция на общий пакет Tailwind CSS

Этот документ описывает процесс миграции с отдельных установок Tailwind CSS на общий пакет `@turbo-super/tailwind`.

## Зачем нужна миграция?

**Проблемы текущего подхода:**

- Дублирование зависимостей в каждом проекте
- Разные версии Tailwind CSS
- Отсутствие единой темы и стилей
- Сложность поддержки консистентности

**Преимущества общего пакета:**

- Единая версия Tailwind CSS
- Общая тема и CSS переменные
- Переиспользование компонентов
- Легкость обновления и поддержки

## Шаги миграции

### 1. Установка зависимостей

```bash
# В корне монорепозитория
pnpm install

# Сборка пакета tailwind
cd packages/tailwind
pnpm build
```

### 2. Обновление конфигурации Tailwind

#### В super-landing (tailwind.config.js)

```js
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

#### В super-chatbot (tailwind.config.ts)

```ts
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

### 3. Обновление package.json

#### Удалить дублирующиеся зависимости:

```json
{
  "devDependencies": {
    // УДАЛИТЬ:
    // "@tailwindcss/typography": "^0.5.15",
    // "autoprefixer": "^10.4.16",
    // "postcss": "^8.4.32",
    // "tailwindcss": "^3.4.0",

    // ДОБАВИТЬ:
    "@turbo-super/tailwind": "workspace:*"
  }
}
```

### 4. Обновление CSS импортов

В вашем основном CSS файле (например, `globals.css`):

```css
/* ЗАМЕНИТЬ: */
/* @tailwind base; */
/* @tailwind components; */
/* @tailwind utilities; */

/* НА: */
@import "@turbo-super/tailwind/css";

/* Ваши дополнительные стили остаются без изменений */
```

### 5. Проверка работы

```bash
# В super-landing
cd apps/super-landing
pnpm dev

# В super-chatbot
cd apps/super-chatbot
pnpm dev
```

## Новые возможности

### Готовые CSS классы

```css
/* Кнопки */
.btn-accent

/* Карточки */
.card-enhanced

/* Эффекты */
.glassmorphism
.gradient-border
.neon-glow
```

### CSS переменные

```css
/* Автоматически доступны */
--primary: 85 100% 60%;
--background: 220 13% 5%;
--foreground: 0 0% 93%;
```

## Устранение проблем

### Ошибка "Cannot find module '@turbo-super/tailwind/config'"

1. Убедитесь, что пакет собран:

   ```bash
   cd packages/tailwind
   pnpm build
   ```

2. Проверьте, что зависимость добавлена в package.json

3. Переустановите зависимости:
   ```bash
   pnpm install
   ```

### Стили не применяются

1. Проверьте, что CSS импортирован
2. Убедитесь, что content paths в tailwind.config корректны
3. Проверьте, что PostCSS настроен правильно

## Обратная миграция

Если нужно вернуться к отдельным установкам:

1. Установить Tailwind CSS локально в каждый проект
2. Восстановить оригинальные конфигурации
3. Убрать зависимость от `@turbo-super/tailwind`

## Поддержка

При возникновении проблем:

1. Проверьте логи сборки
2. Убедитесь, что все зависимости установлены
3. Проверьте совместимость версий
4. Обратитесь к документации пакета `@turbo-super/tailwind`

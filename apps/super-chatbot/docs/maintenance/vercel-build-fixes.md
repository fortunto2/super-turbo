# Исправление проблем с билдом в Vercel

## Проблемы и решения

### 🔍 Основные проблемы

1. **Конфликт версий Node.js**
   - Лендинг: Node.js >=20.18.1
   - Чатбот: Node.js >=18.17.0 (исправлено на >=20.18.1)

2. **Проблемы с workspace зависимостями**
   - Множественные зависимости @turbo-super/\*
   - Неправильная последовательность сборки

3. **Конфигурация Vercel**
   - Неправильные команды build и install
   - Отсутствие правильных настроек функций

4. **Webpack конфигурация**
   - Слишком сложные оптимизации
   - Конфликты с экспериментальными функциями

### ✅ Внесенные исправления

#### 1. Обновление package.json

```json
{
  "engines": {
    "node": ">=20.18.1" // Было: ">=18.17.0"
  },
  "scripts": {
    "build": "next build" // Убрали fallback на warnings
  },
  "dependencies": {
    "next-auth": "^5.0.0" // Было: "5.0.0-beta.25"
  }
}
```

#### 2. Исправление vercel.json

```json
{
  "buildCommand": "pnpm run build", // Было: "pnpm --filter=ai-chatbot run build"
  "installCommand": "pnpm install", // Было: сложная фильтрация
  "framework": null,
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 3. Упрощение next.config.ts

- Убраны сложные webpack оптимизации
- Оставлены только необходимые настройки для Sentry и OpenTelemetry
- Упрощена конфигурация experimental функций
- Добавлена настройка webpack кэша для решения проблем с большими строками
- Добавлены игнорирования предупреждений webpack

#### 4. Обновление turbo.json

- Добавлены globalDependencies для лучшего кеширования
- Улучшена поддержка workspace зависимостей

#### 5. Исправление ошибки parseSemver

- Обновлен next-auth с beta версии до стабильной
- Добавлена обработка ошибок в auth routes
- Исправлены проблемы с webpack кэшем

#### 6. Улучшение очистки workspace

- Создан скрипт `scripts/clean-workspace.js` для полной очистки
- Улучшен скрипт `scripts/clean.js` с поддержкой glob паттернов
- Добавлены команды `pnpm clean` и `pnpm clean:all`
- Исправлены проблемы с остающимися `node_modules` в пакетах

### 🚀 Рекомендации для Vercel

#### Настройки проекта в Vercel:

1. **Node.js Version**: 20.18.1 или выше
2. **Build Command**: `pnpm run build`
3. **Install Command**: `pnpm install`
4. **Root Directory**: `apps/super-chatbot`

#### Environment Variables:

Убедитесь, что все необходимые переменные окружения настроены:

- `SUPERDUPERAI_URL`
- `SUPERDUPERAI_TOKEN`
- `AZURE_OPENAI_*` переменные
- `STRIPE_*` переменные
- `DATABASE_URL`
- `REDIS_URL`

#### Порядок сборки в monorepo:

1. Сначала собираются workspace пакеты
2. Затем приложения (лендинг, чатбот)

### 🔧 Диагностика

Используйте скрипт проверки:

```bash
pnpm check:build
```

Этот скрипт проверит:

- Конфигурацию package.json
- Наличие next.config.ts
- Настройки vercel.json
- Workspace зависимости

### 📋 Чек-лист для деплоя

- [ ] Node.js версия >=20.18.1
- [ ] Все workspace пакеты собраны
- [ ] Environment variables настроены
- [ ] Build команда работает локально
- [ ] Нет TypeScript ошибок
- [ ] Нет ESLint ошибок

### 🆘 Если проблемы остаются

1. **Проверьте логи Vercel** на предмет конкретных ошибок
2. **Убедитесь в правильности workspace зависимостей**:
   ```bash
   pnpm list --depth=0
   ```
3. **Проверьте сборку локально**:
   ```bash
   pnpm install
   pnpm run build
   ```
4. **Очистите кеш** и попробуйте снова

### 📚 Связанные документы

- [Webpack Warnings Fix](./webpack-warnings-fix.md)
- [Troubleshooting Guide](../../TROUBLESHOOTING.md)
- [AI Development Methodology](../development/ai-development-methodology.md)

# Управление моделями Gemini

## Быстрое переключение моделей

### Способ 1: Через утилиту (рекомендуется)

```bash
# Показать текущие модели
node switch-gemini-model.mjs

# Показать список популярных моделей
node switch-gemini-model.mjs --list

# Переключить main модель
node switch-gemini-model.mjs gemini-2.0-flash
```

### Способ 2: Ручное редактирование .env.local

Откройте файл `.env.local` и добавьте/измените строки:

```env
# Основная модель для чата
GEMINI_MAIN_MODEL=gemini-2.5-flash

# Pro модель для сложных задач
GEMINI_PRO_MODEL=gemini-2.5-pro

# Flash модель для быстрых ответов
GEMINI_FLASH_MODEL=gemini-2.5-flash
```

После изменения **перезапустите dev сервер**.

## Что делать при исчерпании квоты

### Вариант 1: Переключить модель

```bash
# Переключиться на модель с отдельной квотой
node switch-gemini-model.mjs gemini-2.0-flash

# Или на облегченную версию
node switch-gemini-model.mjs gemini-2.5-flash-lite
```

### Вариант 2: Использовать другой API ключ

1. Получите новый API ключ на https://aistudio.google.com/apikey
2. Обновите `GOOGLE_AI_API_KEY` в `.env.local`
3. Перезапустите сервер

### Вариант 3: Дождаться сброса квоты

Квота сбрасывается каждые 24 часа. Проверить текущую квоту можно на https://ai.dev/usage?tab=rate-limit

## Доступные модели

Для получения полного актуального списка моделей:

```bash
node list-gemini-models.mjs
```

### Популярные модели

| Модель | Описание | Когда использовать |
|--------|----------|-------------------|
| `gemini-2.5-flash` | Стабильная, быстрая (июнь 2025) | **Рекомендуется** для повседневного использования |
| `gemini-2.5-flash-lite` | Облегченная версия 2.5 | Для экономии квоты |
| `gemini-2.5-pro` | Pro версия 2.5 | Для сложных задач |
| `gemini-2.0-flash` | Flash 2.0 | Альтернатива при исчерпании квоты |
| `gemini-2.0-flash-001` | Стабильная версия 2.0 | Стабильная альтернатива |
| `gemini-flash-latest` | Всегда последняя Flash | Для использования новейших функций |
| `gemini-pro-latest` | Всегда последняя Pro | Для использования новейших функций |

## Мониторинг использования

При запуске сервера вы увидите текущую конфигурацию моделей:

```
🤖 Gemini Models Configuration:
   Main: gemini-2.5-flash
   Pro: gemini-2.5-pro
   Flash: gemini-2.5-flash
   Fallback: gemini-2.0-flash-001
```

## Квоты и лимиты

### Бесплатный план (Free tier)

- **Gemini 2.0 Flash Experimental**: 50 запросов/день
- **Gemini 2.5 Flash**: Отдельная квота (обычно выше)
- **Gemini 2.5 Pro**: Отдельная квота (обычно ниже)

### Проверка квоты

1. Перейдите на https://ai.dev/usage?tab=rate-limit
2. Войдите с вашим Google аккаунтом
3. Посмотрите использование по каждой модели

## Примеры использования

### Пример 1: Переключение при ошибке квоты

```bash
# У вас закончилась квота gemini-2.5-flash
# Переключитесь на модель с отдельной квотой
node switch-gemini-model.mjs gemini-2.0-flash-001

# Перезапустите сервер
pnpm dev
```

### Пример 2: Использование разных моделей для разных целей

В `.env.local`:

```env
# Быстрая модель для обычного чата
GEMINI_MAIN_MODEL=gemini-2.5-flash-lite

# Мощная модель для сложных задач
GEMINI_PRO_MODEL=gemini-2.5-pro

# Средняя модель для генерации заголовков
GEMINI_FLASH_MODEL=gemini-2.5-flash
```

### Пример 3: Fallback стратегия

Если вы хотите автоматически переключаться на резервную модель при исчерпании квоты, можно настроить:

```env
GEMINI_FALLBACK_MODEL=gemini-2.0-flash-001
```

## Troubleshooting

### Ошибка: "models/gemini-X is not found"

**Причина**: Модель не доступна в вашем регионе или не поддерживается API версией v1beta.

**Решение**:
1. Запустите `node list-gemini-models.mjs` для проверки доступных моделей
2. Переключитесь на доступную модель из списка

### Ошибка: "Quota exceeded"

**Причина**: Исчерпана квота для текущей модели.

**Решение**:
1. Переключитесь на другую модель: `node switch-gemini-model.mjs gemini-2.0-flash`
2. Или дождитесь сброса квоты (24 часа)
3. Или получите новый API ключ

### Модель не меняется после редактирования .env.local

**Причина**: Сервер не перезапущен или закэшированы переменные окружения.

**Решение**:
1. Остановите сервер (Ctrl+C)
2. Полностью перезапустите: `pnpm dev`
3. Проверьте логи на наличие `🤖 Gemini Models Configuration`

## Дополнительная информация

- [Gemini API Документация](https://ai.google.dev/gemini-api/docs)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [API Key Management](https://aistudio.google.com/apikey)
- [Quota Usage Dashboard](https://ai.dev/usage?tab=rate-limit)

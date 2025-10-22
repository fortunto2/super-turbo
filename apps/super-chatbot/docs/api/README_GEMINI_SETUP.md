# 🚀 Настройка и управление моделями Gemini

## ⚡ Быстрый старт

### При ошибке квоты (Quota exceeded)

**Шаг 1: Переключите модель (5 секунд)**
```bash
pnpm gemini:switch gemini-2.0-flash-001
```

**Шаг 2: Перезапустите сервер**
```bash
pnpm dev
```

Готово! ✅

---

## 📋 Все доступные команды

| Команда | Описание |
|---------|----------|
| `pnpm gemini:switch` | Показать текущую конфигурацию |
| `pnpm gemini:switch <model>` | Переключить main модель |
| `pnpm gemini:models` | Показать популярные модели |
| `pnpm gemini:list` | Показать ВСЕ доступные модели от Google |

---

## 🎯 Популярные сценарии

### 1. Исчерпана квота основной модели

```bash
# Переключиться на резервную модель
pnpm gemini:switch gemini-2.0-flash-001

# Или на облегченную версию (экономия квоты)
pnpm gemini:switch gemini-2.5-flash-lite
```

### 2. Нужна более мощная модель

```bash
# Переключиться на Pro версию
pnpm gemini:switch gemini-2.5-pro
```

### 3. Нужна самая новая модель

```bash
# Всегда последняя Flash версия
pnpm gemini:switch gemini-flash-latest

# Или последняя Pro версия
pnpm gemini:switch gemini-pro-latest
```

### 4. Экономия квоты

```bash
# Облегченная версия потребляет меньше квоты
pnpm gemini:switch gemini-2.0-flash-lite
```

---

## 🔧 Расширенная настройка

### Настройка через .env.local

Откройте `.env.local` и добавьте:

```env
# Основная модель для чата
GEMINI_MAIN_MODEL=gemini-2.5-flash

# Pro модель для сложных задач
GEMINI_PRO_MODEL=gemini-2.5-pro

# Flash модель для быстрых ответов
GEMINI_FLASH_MODEL=gemini-2.5-flash

# Резервная модель при исчерпании квоты
GEMINI_FALLBACK_MODEL=gemini-2.0-flash-001
```

**Важно:** После изменения `.env.local` нужно перезапустить сервер!

### Проверка текущей конфигурации

При запуске сервера вы увидите:

```
🤖 Gemini Models Configuration:
   Main: gemini-2.5-flash
   Pro: gemini-2.5-pro
   Flash: gemini-2.5-flash
   Fallback: gemini-2.0-flash-001
```

---

## 📊 Рекомендуемые модели

### Для повседневного использования
- **`gemini-2.5-flash`** - Стабильная, быстрая, рекомендуется
- **`gemini-2.5-flash-lite`** - Облегченная версия для экономии

### При исчерпании квоты
- **`gemini-2.0-flash-001`** - Стабильная версия с отдельной квотой
- **`gemini-2.0-flash`** - Flash 2.0
- **`gemini-flash-latest`** - Всегда последняя доступная

### Для сложных задач
- **`gemini-2.5-pro`** - Pro версия для reasoning
- **`gemini-pro-latest`** - Всегда последняя Pro

---

## 🔍 Мониторинг и отладка

### Проверка квоты

1. **Dashboard квоты**: https://ai.dev/usage?tab=rate-limit
2. **Получить новый API ключ**: https://aistudio.google.com/apikey

### Просмотр всех доступных моделей

```bash
pnpm gemini:list
```

Эта команда покажет актуальный список всех моделей, доступных для вашего API ключа.

### Логирование

При запуске сервера проверьте консоль на наличие:
```
🤖 Gemini Models Configuration:
```

Если этой строки нет - конфигурация не загружена корректно.

---

## 🐛 Troubleshooting

### ❌ Ошибка: "models/gemini-X is not found"

**Проблема:** Модель не доступна или не поддерживается.

**Решение:**
```bash
# Проверьте доступные модели
pnpm gemini:list

# Переключитесь на доступную
pnpm gemini:switch gemini-2.5-flash
```

### ❌ Ошибка: "Quota exceeded"

**Проблема:** Исчерпана квота для текущей модели.

**Решение:**
```bash
# Быстрое переключение на резервную модель
pnpm gemini:switch gemini-2.0-flash-001

# Или получите новый API ключ
# https://aistudio.google.com/apikey
```

### ❌ Модель не меняется после редактирования

**Проблема:** Сервер не перезапущен или переменные закэшированы.

**Решение:**
```bash
# Полностью остановите сервер (Ctrl+C)
# Затем перезапустите
pnpm dev
```

---

## 📚 Дополнительная документация

- 📖 [Подробная документация](./docs/gemini-models-setup.md)
- 🚀 [Быстрая шпаргалка](./GEMINI_QUICK_START.md)
- 🔗 [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- 📊 [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

---

## 💡 Советы

1. **Всегда имейте резервную модель** - добавьте `GEMINI_FALLBACK_MODEL` в `.env.local`
2. **Используйте lite версии для экономии** - они потребляют меньше квоты
3. **Проверяйте квоту регулярно** - https://ai.dev/usage?tab=rate-limit
4. **Обновляйте конфигурацию через утилиту** - быстрее и безопаснее, чем ручное редактирование

---

Made with ❤️ for easy Gemini model management

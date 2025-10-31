# Gemini Models - Быстрая шпаргалка 🚀

## Что делать при ошибке квоты?

```bash
# 1. Переключить модель (САМЫЙ БЫСТРЫЙ СПОСОБ)
pnpm gemini:switch gemini-2.0-flash

# 2. Перезапустить сервер
pnpm dev
```

## Полезные команды

```bash
# Показать текущую конфигурацию моделей
pnpm gemini:switch

# Показать список популярных моделей
pnpm gemini:models

# Показать ВСЕ доступные модели от Google
pnpm gemini:list

# Переключить main модель
pnpm gemini:switch <model-name>
```

## Популярные модели при исчерпании квоты

```bash
# Стабильная версия 2.0 (обычно работает)
pnpm gemini:switch gemini-2.0-flash-001

# Облегченная версия (экономия квоты)
pnpm gemini:switch gemini-2.5-flash-lite

# Всегда последняя Flash
pnpm gemini:switch gemini-flash-latest
```

## Ручная настройка в .env.local

```env
# Добавьте или измените эти строки
GEMINI_MAIN_MODEL=gemini-2.0-flash
GEMINI_PRO_MODEL=gemini-2.5-pro
GEMINI_FLASH_MODEL=gemini-2.5-flash
```

**После изменения обязательно перезапустите сервер!**

## Проверка квоты

- Dashboard: https://ai.dev/usage?tab=rate-limit
- Новый API ключ: https://aistudio.google.com/apikey

## Подробная документация

См. [docs/gemini-models-setup.md](./docs/gemini-models-setup.md)

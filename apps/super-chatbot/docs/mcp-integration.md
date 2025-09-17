# MCP Integration Guide

## Обзор

Этот проект интегрирован с [Model Context Protocol (MCP)](https://github.com/vercel/mcp-handler), что позволяет использовать все AI инструменты из папки `/tools/` в любых MCP-совместимых клиентах.

## Доступные инструменты

### 1. `generate_image` - Генерация изображений

Создает высококачественные изображения с помощью AI моделей.

**Параметры:**

- `prompt` (обязательный) - Подробное описание изображения
- `model` (опционально) - AI модель для генерации
- `resolution` (опционально) - Разрешение изображения (например, '1024x1024')
- `style` (опционально) - Художественный стиль
- `shotSize` (опционально) - Размер кадра
- `seed` (опционально) - Случайное число для воспроизводимых результатов
- `generationType` (опционально) - Тип генерации: 'text-to-image' или 'image-to-image'
- `sourceImageUrl` (опционально) - URL исходного изображения для image-to-image

### 2. `generate_video` - Генерация видео

Создает видео с помощью AI моделей из текста или изображений.

**Параметры:**

- `prompt` (обязательный) - Подробное описание видео
- `model` (опционально) - AI модель для генерации
- `resolution` (опционально) - Разрешение видео (например, '1280x720')
- `style` (опционально) - Стиль видео
- `duration` (опционально) - Длительность в секундах
- `frameRate` (опционально) - Частота кадров (например, 30)
- `generationType` (опционально) - Тип генерации: 'text-to-video' или 'image-to-video'
- `sourceImageUrl` (опционально) - URL исходного изображения для image-to-video
- `negativePrompt` (опционально) - Что избегать в видео

### 3. `enhance_prompt` - Улучшение промптов

Улучшает и оптимизирует промпты для лучших результатов AI генерации.

**Параметры:**

- `originalPrompt` (обязательный) - Исходный промпт для улучшения
- `mediaType` (опционально) - Тип медиа: 'image', 'video', 'text', 'general'
- `enhancementLevel` (опционально) - Уровень улучшения: 'basic', 'detailed', 'creative'
- `targetAudience` (опционально) - Целевая аудитория
- `includeNegativePrompt` (опционально) - Включать ли предложения негативных промптов
- `modelHint` (опционально) - Подсказка о том, какая AI модель будет использоваться

### 4. `generate_script` - Генерация скриптов

Создает скрипты для видео, презентаций или другого контента.

**Параметры:**

- `prompt` (обязательный) - Описание скрипта для генерации
- `scriptType` (опционально) - Тип скрипта: 'video', 'presentation', 'story', 'dialogue', 'narrative'
- `length` (опционально) - Желаемая длина: 'short', 'medium', 'long'
- `tone` (опционально) - Тон: 'formal', 'casual', 'professional', 'creative', 'educational'
- `targetAudience` (опционально) - Целевая аудитория
- `includeStructure` (опционально) - Включать ли структурные элементы

### 5. `get_available_models` - Получение доступных моделей

Возвращает список доступных AI моделей для разных типов генерации.

**Параметры:**

- `type` (опционально) - Тип моделей: 'image', 'video', 'text'

## Настройка клиентов

### Claude Desktop

Добавьте в конфигурационный файл `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "super-turbo-tools": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

**Расположение файла:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

### Cursor

Добавьте в конфигурационный файл `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "super-turbo-tools": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

### Windsurf

Добавьте в конфигурационный файл `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "super-turbo-tools": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

## Запуск сервера

1. Убедитесь, что приложение запущено:

   ```bash
   cd apps/super-chatbot
   pnpm dev
   ```

2. MCP сервер будет доступен по адресу: `http://localhost:3000/api/mcp`

## Примеры использования

### Генерация изображения

```javascript
// В MCP клиенте
const result = await client.request("generate_image", {
  prompt: "A beautiful sunset over mountains with a lake in the foreground",
  style: "photographic",
  resolution: "1024x1024",
});
```

### Генерация видео

```javascript
// В MCP клиенте
const result = await client.request("generate_video", {
  prompt: "A person walking through a forest in autumn",
  duration: 5,
  style: "cinematic",
  resolution: "1280x720",
});
```

### Улучшение промпта

```javascript
// В MCP клиенте
const result = await client.request("enhance_prompt", {
  originalPrompt: "A cat",
  mediaType: "image",
  enhancementLevel: "detailed",
  targetAudience: "children",
});
```

## Технические детали

- **Транспорт**: HTTP/SSE через mcp-handler
- **Аутентификация**: Использует существующую систему аутентификации приложения
- **Таймауты**: Максимальное время выполнения 5 минут
- **Логирование**: Подробные логи включены для отладки

## Устранение неполадок

### Проблема: "Connection refused"

- Убедитесь, что приложение запущено на порту 3000
- Проверьте, что MCP роут доступен: `http://localhost:3000/api/mcp`

### Проблема: "Tool not found"

- Убедитесь, что все API роуты реализованы в `app/api/`
- Проверьте логи сервера на наличие ошибок

### Проблема: "Authentication failed"

- Убедитесь, что пользователь аутентифицирован в приложении
- Проверьте настройки сессий и cookies

## Разработка

Для добавления новых инструментов:

1. Создайте API функцию в соответствующей папке `tools/*/api/`
2. Зарегистрируйте инструмент в `app/api/mcp/[transport]/route.ts`
3. Добавьте описание в capabilities
4. Обновите документацию

## Безопасность

- Все запросы проходят через существующую систему аутентификации
- Валидация входных данных с помощью Zod схем
- Ограничения по времени выполнения для предотвращения злоупотреблений
- Логирование всех операций для аудита

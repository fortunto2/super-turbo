# MCP (Model Context Protocol) - Руководство по использованию

## Что такое MCP?

**MCP (Model Context Protocol)** - это открытый стандарт, который позволяет AI моделям подключаться к внешним инструментам и данным. Это как "руки" для AI - он может использовать ваши инструменты для выполнения задач.

## Где используется MCP?

### 1. Claude Desktop (Anthropic)

- Официальный клиент от создателей Claude
- Поддерживает MCP из коробки
- Скачать: https://claude.ai/download

### 2. Cursor (ваш текущий редактор)

- Встроенная поддержка MCP
- Может использовать ваши инструменты напрямую

### 3. VS Code с MCP расширениями

- Расширения для интеграции MCP
- Работает с различными AI моделями

## Как настроить MCP сервер

### 1. Конфигурация для Claude Desktop

Создайте файл `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "super-turbo-tools": {
      "command": "node",
      "args": ["path/to/your/mcp-server.js"],
      "env": {
        "API_URL": "http://localhost:3000/api/mcp"
      }
    }
  }
}
```

### 2. Конфигурация для Cursor

В настройках Cursor добавьте:

```json
{
  "mcp": {
    "servers": {
      "super-turbo": {
        "url": "http://localhost:3000/api/mcp",
        "tools": [
          "generate_image",
          "generate_video",
          "enhance_prompt",
          "generate_script"
        ]
      }
    }
  }
}
```

## Доступные инструменты

### 1. `generate_image` - Генерация изображений

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "Красивый закат над океаном в стиле импрессионизма",
    "model": "dall-e-3",
    "resolution": "1024x1024",
    "style": "impressionist",
    "shotSize": "wide"
  }
}
```

### 2. `generate_video` - Генерация видео

```json
{
  "name": "generate_video",
  "arguments": {
    "prompt": "Кот играет с мячиком в солнечной комнате",
    "model": "veo-3",
    "resolution": "1280x720",
    "duration": 5,
    "frameRate": 30
  }
}
```

### 3. `enhance_prompt` - Улучшение промптов

```json
{
  "name": "enhance_prompt",
  "arguments": {
    "originalPrompt": "создай картинку кота",
    "mediaType": "image",
    "enhancementLevel": "detailed",
    "targetAudience": "дети"
  }
}
```

### 4. `generate_script` - Генерация скриптов

```json
{
  "name": "generate_script",
  "arguments": {
    "prompt": "Создай скрипт для видео о приготовлении пиццы",
    "scriptType": "video",
    "length": "medium",
    "tone": "casual"
  }
}
```

## Как протестировать MCP

### 1. Через HTTP запросы

```bash
# Получить список инструментов
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Вызвать инструмент
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "generate_image",
      "arguments": {
        "prompt": "Красивый закат"
      }
    },
    "id": 2
  }'
```

### 2. Через PowerShell

```powershell
# Получить список инструментов
$body = @{
    jsonrpc = "2.0"
    method = "tools/list"
    id = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/mcp" -Method POST -Body $body -ContentType "application/json"

# Вызвать инструмент
$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    params = @{
        name = "generate_image"
        arguments = @{
            prompt = "Красивый закат"
        }
    }
    id = 2
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/mcp" -Method POST -Body $body -ContentType "application/json"
```

## Примеры использования

### В Claude Desktop:

```
Пользователь: "Создай изображение кота в космосе"
Claude: Использую инструмент generate_image...
[Вызывает MCP инструмент]
Claude: Вот изображение кота в космосе! [показывает результат]
```

### В Cursor:

```
Пользователь: "Улучши этот промпт: 'создай видео'"
Cursor: Использую инструмент enhance_prompt...
[Вызывает MCP инструмент]
Cursor: Улучшенный промпт: "Создай динамичное видео продолжительностью 30 секунд с плавными переходами, профессиональным освещением и качественной цветокоррекцией..."
```

## Преимущества MCP

1. **Универсальность** - один сервер работает с разными AI клиентами
2. **Безопасность** - инструменты изолированы от AI модели
3. **Расширяемость** - легко добавлять новые инструменты
4. **Стандартизация** - единый протокол для всех инструментов

## Следующие шаги

1. Исправить проблемы с сервером
2. Добавить реальную реализацию инструментов
3. Настроить аутентификацию
4. Добавить логирование и мониторинг
5. Создать клиентские приложения для тестирования

## Полезные ссылки

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Claude Desktop](https://claude.ai/download)
- [Cursor MCP Documentation](https://cursor.sh/docs)
- [MCP Examples](https://github.com/modelcontextprotocol/examples)

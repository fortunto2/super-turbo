# Image Generation (text-to-image)

## Recent Updates

- **January 27, 2025**: [Image Editing Mode](image-editing-mode.md) - Встроенный режим редактирования изображений в артефактах
- **January 27, 2025**: [Smart Image Context Understanding](smart-image-context.md) - AI now understands which image user refers to
- **January 15, 2025**: [Optimized artifact content structure](artifact-content-structure.md) - Reduced storage by 80%
- **January 15, 2025**: [Phase 1 Optimization](../../maintenance/changelog/optimize-image-artifact-content-phase1.md) - Removed redundant data from artifacts

## Overview

Image generation в проекте реализована через современную архитектуру с использованием паттерна "стратегия" (strategy pattern). Поддерживается режим text-to-image (генерация по текстовому prompt) и image-to-image (редактирование существующих изображений).

- Используется единая точка входа: `generateImageWithStrategy('text-to-image', params)`
- Все параметры и логика генерации централизованы в папке `lib/ai/api/image-generation/`
- Артефакты создаются через handler `artifacts/image/server.ts`
- **Новое**: Система автоматически понимает контекст изображений в чате

## Архитектура

- `generateImageWithStrategy(type, params)` — основная функция, выбирающая стратегию по типу
- `TextToImageStrategy` — реализует генерацию по prompt
- Все параметры (prompt, model, style, resolution, shotSize, negativePrompt, seed, batchSize) передаются явно
- Нет поддержки image-to-image, sourceImageId, file и т.д. (можно добавить позже)

## Пример использования

```ts
import { generateImageWithStrategy } from "@/lib/ai/api/image-generation";

const result = await generateImageWithStrategy("text-to-image", {
  prompt: "A futuristic cityscape at sunset",
  model: { id: "flux-dev", label: "Flux Dev" },
  style: { id: "flux_steampunk", label: "Steampunk" },
  resolution: {
    width: 1024,
    height: 1024,
    label: "1024x1024",
    aspectRatio: "1:1",
    qualityType: "hd",
  },
  shotSize: { id: "long_shot", label: "Long Shot" },
  negativePrompt: "",
  seed: 12345,
  batchSize: 1,
});
```

## Handler для артефактов

В `artifacts/image/server.ts` используется только text-to-image:

```ts
const result = await generateImageWithStrategy("text-to-image", params);
```

## Особенности

- Нет dual-mode, нет polling, только text-to-image
- Все параметры валидируются стратегией
- Легко расширяется для новых режимов (image-to-image и др.)

## Расширение

Чтобы добавить новые режимы (например, image-to-image), реализуйте новую стратегию и зарегистрируйте её в фабрике стратегий.

## Image Editing Mode

Добавлен встроенный режим редактирования изображений прямо в артефактах:

### Ключевые возможности

- **Встроенный редактор** - редактирование без перехода на внешние сервисы
- **Два режима** - базовое и расширенное редактирование
- **Интеграция с чатом** - сохранение изменений в истории чата
- **Отмена изменений** - возможность вернуться к оригиналу

### Как использовать

1. Откройте изображение в артефакте
2. Нажмите кнопку "✏️ Редактировать изображение"
3. Выберите режим редактирования
4. Внесите изменения
5. Сохраните или отмените

Подробная документация: [Image Editing Mode](image-editing-mode.md)

## Smart Image Context Understanding

Система теперь автоматически анализирует контекст чата для определения того, к какому изображению обращается пользователь:

### Ключевые возможности

- **Автоматический анализ контекста** - система понимает "это изображение", "последнее фото", "первая картинка"
- **Многоязычная поддержка** - работает на русском и английском языках
- **Умный выбор изображений** - анализирует историю чата и выбирает релевантное изображение
- **Fallback безопасность** - всегда есть изображение для работы

### Примеры использования

```
User: "Сделай глаза голубыми"
System: ✅ Автоматически использует последнее изображение в чате

User: "Измени первое изображение"
System: ✅ Находит первое изображение по порядку

User: "Подправь то что ты сгенерировал"
System: ✅ Использует последнее сгенерированное изображение
```

Подробная документация: [Smart Image Context Understanding](smart-image-context.md)

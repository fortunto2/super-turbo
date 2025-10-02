# Архитектура VEO3 Tools

## Обзор

Пакет `@turbo-super/veo3-tools` предоставляет переиспользуемые компоненты для работы с инструментами VEO3 (Google's AI Video Model). Архитектура построена по принципу модульности и переиспользования.

## Структура пакетов

```
turbo-super/
├── packages/
│   ├── ui/                    # Базовые UI компоненты
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── shared/                # Общие утилиты и хуки
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   ├── veo3-tools/            # Специфичные VEO3 инструменты
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── ...
│   └── data/                  # Общие данные и константы
└── apps/
    ├── super-chatbot/         # Основное приложение
    └── super-landing/         # Лендинг с демо
```

## Принципы архитектуры

### 1. Разделение ответственности

- **UI пакет** - только базовые UI компоненты (кнопки, карточки, поля ввода)
- **Shared пакет** - общие утилиты, хуки, валидация
- **Veo3-tools пакет** - специфичная логика для VEO3
- **Data пакет** - общие данные и константы

### 2. Модульность

Каждый пакет может использоваться независимо:

```tsx
// Только UI компоненты
import { Button, Card } from "@turbo-super/ui";

// Только VEO3 инструменты
import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";

// Общие утилиты
import { useDebounce } from "@turbo-super/shared";
```

### 3. Гибкость

Компоненты принимают внешние функции для кастомизации:

```tsx
<Veo3PromptGenerator
  enhancePromptFunction={myCustomEnhanceFunction}
  MoodboardUploader={myCustomMoodboardComponent}
  showInfoBanner={false}
/>
```

## Компоненты VEO3 Tools

### Veo3PromptGenerator

Главный компонент, который объединяет все функциональности:

- **PromptBuilder** - построение структурированного промпта
- **PromptPreview** - предварительный просмотр и редактирование
- **AIEnhancement** - улучшение промпта с помощью AI
- **PromptHistory** - история промптов

### Хуки

#### usePromptData
Управляет состоянием данных промпта:
- Создание/обновление/удаление персонажей
- Управление сценой, стилем, камерой
- Автоматическое определение языка

#### usePromptHistory
Управляет историей промптов:
- Сохранение в localStorage
- Загрузка из истории
- Ограничение количества записей

### Утилиты

- `generatePrompt()` - генерация текста из структурированных данных
- `createRandomPromptData()` - создание случайных данных для демо
- `copyToClipboard()` - копирование в буфер обмена
- `getLocaleLanguage()` - определение языка из URL

## Использование в разных приложениях

### Super Chatbot

```tsx
// apps/super-chatbot/src/app/tools/prompt-enhancer-veo3/page.tsx
import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";
import { enhancePromptVeo3 } from "@/lib/ai/api/enhance-prompt-veo3";

export default function Page() {
  const enhanceFunction = async (params) => {
    return await enhancePromptVeo3({ body: JSON.stringify(params) });
  };

  return <Veo3PromptGenerator enhancePromptFunction={enhanceFunction} />;
}
```

### Super Landing (Демо)

```tsx
// apps/super-landing/src/app/veo3-demo/page.tsx
import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";

export default function DemoPage() {
  const mockEnhanceFunction = async (params) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { enhancedPrompt: `Enhanced: ${params.prompt}` };
  };

  return <Veo3PromptGenerator enhancePromptFunction={mockEnhanceFunction} />;
}
```

## Преимущества архитектуры

### 1. Переиспользование

Один компонент используется в разных приложениях с разными функциями улучшения.

### 2. Тестируемость

Каждый модуль можно тестировать независимо:
- UI компоненты - визуальные тесты
- Хуки - unit тесты
- Утилиты - unit тесты

### 3. Масштабируемость

Легко добавлять новые функции:
- Новые типы фокуса для AI улучшения
- Дополнительные поля в промпте
- Новые компоненты для moodboard

### 4. Производительность

- Tree shaking - неиспользуемый код исключается
- Ленивая загрузка компонентов
- Оптимизированные хуки с мемоизацией

## Миграция с монолитной структуры

### До (монолитная структура)

```tsx
// Все в одном файле
export default function SimpleVeo3Generator() {
  // 365 строк кода
  // Смешанная логика UI и бизнес-логики
  // Сложно переиспользовать
}
```

### После (модульная структура)

```tsx
// Простое использование
import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";

export default function Page() {
  return <Veo3PromptGenerator enhancePromptFunction={myFunction} />;
}
```

## Рекомендации по развитию

### 1. Добавление новых функций

```tsx
// Расширение типов
interface PromptData {
  // существующие поля...
  newField?: string;
}

// Новые хуки
export const useNewFeature = () => {
  // логика новой функции
};
```

### 2. Кастомизация

```tsx
// Пропсы для кастомизации
interface Veo3PromptGeneratorProps {
  // существующие пропсы...
  customComponents?: {
    MoodboardUploader?: React.ComponentType;
    CustomButton?: React.ComponentType;
  };
}
```

### 3. Интернационализация

```tsx
// Поддержка разных языков
interface Veo3PromptGeneratorProps {
  locale?: string;
  translations?: Record<string, string>;
}
```

## Заключение

Архитектура VEO3 Tools обеспечивает:

- ✅ Переиспользование компонентов
- ✅ Четкое разделение ответственности
- ✅ Легкость тестирования
- ✅ Простоту кастомизации
- ✅ Масштабируемость

Это позволяет эффективно использовать компоненты в разных проектах, сохраняя при этом гибкость и производительность. 
# @turbo-super/veo3-tools

Пакет для работы с инструментами VEO3 (Google's AI Video Model). Содержит компоненты для создания и улучшения промптов для генерации видео.

## Установка

```bash
pnpm add @turbo-super/veo3-tools
```

## Использование

### Основной компонент

```tsx
import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";

function MyPage() {
  const enhancePromptFunction = async (params) => {
    // Ваша функция для улучшения промпта
    const response = await fetch('/api/enhance-prompt', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return response.json();
  };

  return (
    <Veo3PromptGenerator
      enhancePromptFunction={enhancePromptFunction}
      showInfoBanner={true}
    />
  );
}
```

### Отдельные компоненты

```tsx
import { 
  PromptBuilder, 
  PromptPreview, 
  AIEnhancement, 
  PromptHistory 
} from "@turbo-super/veo3-tools";
import { usePromptData, usePromptHistory } from "@turbo-super/veo3-tools";
```

### Хуки

```tsx
import { usePromptData, usePromptHistory } from "@turbo-super/veo3-tools";

function MyComponent() {
  const { promptData, addCharacter, updateCharacter } = usePromptData();
  const { promptHistory, saveToHistory } = usePromptHistory();
  
  // Ваша логика
}
```

### Утилиты

```tsx
import { 
  generatePrompt, 
  createRandomPromptData, 
  copyToClipboard 
} from "@turbo-super/veo3-tools";

// Генерация промпта из данных
const prompt = generatePrompt(promptData);

// Создание случайных данных
const randomData = createRandomPromptData();

// Копирование в буфер обмена
await copyToClipboard("текст для копирования");
```

### Типы

```tsx
import { 
  PromptData, 
  Character, 
  EnhancementInfo,
  MoodboardImage 
} from "@turbo-super/veo3-tools";

interface MyComponentProps {
  promptData: PromptData;
  characters: Character[];
}
```

## API

### Veo3PromptGenerator

Основной компонент, который объединяет все функциональности.

#### Props

- `enhancePromptFunction?: (params) => Promise<EnhancementResult>` - Функция для улучшения промпта
- `MoodboardUploader?: React.ComponentType` - Компонент для загрузки изображений moodboard
- `showInfoBanner?: boolean` - Показывать ли информационный баннер (по умолчанию: true)
- `className?: string` - Дополнительные CSS классы

### Хуки

#### usePromptData()

Возвращает:
- `promptData: PromptData` - Данные промпта
- `setPromptData: (data: PromptData) => void` - Функция для обновления данных
- `addCharacter: () => void` - Добавить персонажа
- `updateCharacter: (id, field, value) => void` - Обновить персонажа
- `removeCharacter: (id) => void` - Удалить персонажа
- `clearAll: () => void` - Очистить все данные

#### usePromptHistory()

Возвращает:
- `promptHistory: HistoryItem[]` - История промптов
- `saveToHistory: (basic, enhanced, length, model, data) => void` - Сохранить в историю
- `clearHistory: () => void` - Очистить историю

### Утилиты

#### generatePrompt(data: PromptData): string
Генерирует промпт из структурированных данных.

#### createRandomPromptData(): PromptData
Создает случайные данные промпта для демонстрации.

#### copyToClipboard(text: string): Promise<boolean>
Копирует текст в буфер обмена.

#### getLocaleLanguage(): string
Определяет язык на основе URL.

## Структура

```
packages/veo3-tools/
├── src/
│   ├── components/
│   │   ├── Veo3PromptGenerator.tsx    # Главный компонент
│   │   ├── PromptBuilder.tsx          # Построитель промптов
│   │   ├── PromptPreview.tsx          # Предварительный просмотр
│   │   ├── AIEnhancement.tsx          # AI улучшение
│   │   ├── PromptHistory.tsx          # История промптов
│   │   └── index.ts                   # Экспорт компонентов
│   ├── hooks/
│   │   ├── use-prompt-data.ts         # Хук для данных промпта
│   │   ├── use-prompt-history.ts      # Хук для истории
│   │   └── index.ts                   # Экспорт хуков
│   ├── types/
│   │   └── index.ts                   # Типы TypeScript
│   ├── utils/
│   │   └── index.ts                   # Утилиты
│   ├── constants/
│   │   └── index.ts                   # Константы
│   └── index.ts                       # Главный экспорт
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Разработка

```bash
# Установка зависимостей
pnpm install

# Сборка пакета
pnpm build

# Разработка с watch режимом
pnpm dev

# Проверка типов
pnpm type-check

# Линтинг
pnpm lint
``` 
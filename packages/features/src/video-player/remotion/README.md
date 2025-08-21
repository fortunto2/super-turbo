# Remotion Export - Упрощенная версия для показа видео

Это упрощенная версия Remotion плеера, которая содержит только необходимый
функционал для показа видео без сложных настроек.

## Что включено

- **Базовый плеер** - простой плеер для воспроизведения видео
- **Компонент сцены** - для показа видео/изображений
- **Аудио поддержка** - базовое воспроизведение аудио (музыка, голос, звуковые
  эффекты)
- **Адаптивный размер** - автоматически подстраивается под контейнер
- **Переходы fade** - плавные переходы между сценами
- **FabricCanvas** - отображение текста и объектов поверх видео

## Что удалено

- Сложные настройки зума и эффектов
- Водяные знаки и постеры
- Сложная логика громкости
- Настройки пользователя
- Сложные типы переходов (оставлен только fade)

## Использование

### Основной плеер

```tsx
import { RemotionPlayer } from "./remotion-export/player";

<RemotionPlayer
    scenes={scenes}
    music={music}
    aspectRatio={16 / 9}
    isLoading={false}
/>;
```

### Структура сцены

```typescript
type Scene = {
    duration: number; // длительность в секундах
    file: {
        type: "video" | "image";
        url: string;
    };
    objects?: any[]; // объекты для FabricCanvas (текст, фигуры)
    sound_effect?: {
        url: string;
    };
    voiceover?: {
        url: string;
    };
};
```

### Структура музыки

```typescript
type Music = {
    file: {
        url: string;
    };
};
```

## Зависимости

- `@remotion/player` - основной плеер
- `remotion` - компоненты для видео
- `@remotion/transitions` - переходы между сценами
- `@radix-ui/themes` - темы (для composition)
- `@/shared/ui` - FabricCanvas компонент

## Пример использования

Смотрите файл `example-usage.tsx` для полного примера.

```tsx
const scenes = [
    {
        duration: 5,
        file: {
            type: "video",
            url: "https://example.com/video.mp4",
        },
        objects: [
            {
                type: "text",
                text: "Привет, мир!",
                left: 100,
                top: 100,
                fontSize: 48,
                fill: "white",
            },
        ],
        voiceover: {
            url: "https://example.com/voice.mp3",
        },
    },
    {
        duration: 3,
        file: {
            type: "image",
            url: "https://example.com/image.jpg",
        },
    },
];

const music = {
    file: {
        url: "https://example.com/music.mp3",
    },
};

<RemotionPlayer
    scenes={scenes}
    music={music}
    aspectRatio={16 / 9}
/>;
```

## Структура файлов

```
remotion-export/
├── README.md                 # Документация
├── example-usage.tsx         # Пример использования
├── player.tsx               # Основной плеер
├── utils.ts                 # Утилиты (FPS, расчет длительности)
├── components/
│   ├── scene.tsx           # Компонент одной сцены
│   ├── scenes.tsx          # Управление всеми сценами
│   ├── video-component.tsx # Основной компонент видео
│   ├── volumes.tsx         # Управление аудио
│   └── audio-player.tsx    # Аудио плеер
└── compositions/
    └── storyboard-composition.tsx # Composition для экспорта
```

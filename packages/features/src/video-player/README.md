# Video Player Package

Пакет для отображения видео сцен с использованием Remotion. Предназначен для работы с SuperDuperAI Project Video API.

## Компоненты

### VideoPlayer

Основной компонент для отображения видео. Автоматически загружает сцены проекта и отображает их с помощью Remotion Player.

```tsx
import { VideoPlayer } from "@turbo-super/features/video-player";

<VideoPlayer
  projectId="your-project-id"
  aspectRatio="16:9"
  autoPlay={false}
  controls={true}
/>;
```

### SceneRenderer

Компонент для рендеринга сцен в Remotion. Используется внутри VideoPlayer.

```tsx
import { SceneRenderer } from "@turbo-super/features/video-player";

<SceneRenderer
  scenes={scenes}
  aspectRatio="16:9"
  duration={30}
  fps={30}
/>;
```

## Хуки

### useVideoScenes

Хук для получения сцен проекта из API.

```tsx
import { useVideoScenes } from "@turbo-super/features/video-player";

const { scenes, isLoading, error, projectStatus, projectProgress } =
  useVideoScenes(projectId);
```

## Типы

```tsx
interface VideoPlayerProps {
  projectId: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
}

interface VideoScene {
  scene: ISceneRead;
  startTime: number;
  endTime: number;
  duration: number;
}
```

## Использование

1. Установите зависимости:

```bash
pnpm add remotion @remotion/player @remotion/renderer
```

2. Импортируйте компонент:

```tsx
import { VideoPlayer } from "@turbo-super/features/video-player";
```

3. Используйте в компоненте:

```tsx
<VideoPlayer
  projectId="your-project-id"
  aspectRatio="16:9"
  autoPlay={false}
  controls={true}
/>
```

## API Endpoints

Для работы пакета требуется API endpoint `/api/story-editor/scenes?projectId={id}`, который должен возвращать массив сцен в формате:

```json
{
  "success": true,
  "scenes": [
    {
      "id": "scene-1",
      "order": 1,
      "visual_description": "Описание сцены",
      "action_description": "Описание действия",
      "dialogue": { "speaker": "Говорящий", "text": "Текст" },
      "duration": 5,
      "file": {
        "id": "file-1",
        "url": "https://example.com/image.jpg",
        "type": "image"
      }
    }
  ]
}
```

## Особенности

- Автоматическое отслеживание статуса проекта
- Поддержка различных соотношений сторон
- Адаптивный дизайн
- Интеграция с Remotion для профессионального рендеринга
- Поддержка изображений, диалогов и описаний сцен





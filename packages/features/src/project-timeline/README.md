# Project Timeline Package

Пакет для работы с timeline проектов SuperDuperAI. Предоставляет хуки и утилиты для управления проектами, их timeline и конвертации в видео.

## Хуки

### useProjectTimeline2Video
Хук для конвертации timeline проекта в видео.

```tsx
import { useProjectTimeline2Video } from '@turbo-super/features/project-timeline';

const { mutate: convertToVideo, isLoading, error } = useProjectTimeline2Video({
  onSuccess: (data) => {
    console.log('Timeline успешно конвертирован в видео:', data);
  },
  onError: (error) => {
    console.error('Ошибка конвертации:', error);
  }
});

// Использование
convertToVideo({ projectId: 'your-project-id' });
```

### useGenerateTimeline
Хук для регенерации timeline проекта.

```tsx
import { useGenerateTimeline } from '@turbo-super/features/project-timeline';

const { mutate: regenerateTimeline, isLoading } = useGenerateTimeline(
  ['regenerate-timeline'], // mutationKey
  {
    onSuccess: (data) => {
      console.log('Timeline регенерирован:', data);
    }
  }
);

// Использование
regenerateTimeline({ projectId: 'your-project-id' });
```

### useDataUpdate
Хук для обновления данных проекта.

```tsx
import { useDataUpdate } from '@turbo-super/features/project-timeline';

const { mutate: updateData, isLoading } = useDataUpdate(true, {
  onSuccess: (data) => {
    console.log('Данные обновлены:', data);
  }
});

// Использование
updateData({
  id: 'data-id',
  project_id: 'project-id',
  // другие поля для обновления
});
```

## Утилиты

### convertSceneToTimeline
Конвертирует сцену в формат timeline.

```tsx
import { convertSceneToTimeline } from '@turbo-super/features/project-timeline';

const timelineData = convertSceneToTimeline(scene);
```

### convertScenesToTimeline
Конвертирует массив сцен в timeline.

```tsx
import { convertScenesToTimeline } from '@turbo-super/features/project-timeline';

const timeline = convertScenesToTimeline(scenes);
```

### isProjectReadyForVideo
Проверяет, готов ли проект к конвертации в видео.

```tsx
import { isProjectReadyForVideo } from '@turbo-super/features/project-timeline';

const isReady = isProjectReadyForVideo(project);
```

### projectQueryKeys
Ключи для React Query.

```tsx
import { projectQueryKeys } from '@turbo-super/features/project-timeline';

const keys = {
  all: projectQueryKeys.all,
  byId: projectQueryKeys.byId('project-id'),
  timeline: projectQueryKeys.timeline('project-id'),
  video: projectQueryKeys.video('project-id'),
};
```

## Типы

```tsx
interface ProjectTimelineProps {
  projectId: string;
  className?: string;
  onTimelineUpdate?: (timeline: TimelineData) => void;
}

interface TimelineData {
  id: string;
  project_id: string;
  order: number;
  visual_description?: string;
  action_description?: string;
  dialogue?: Record<string, any>;
  duration?: number;
  file?: {
    id: string;
    url: string;
    type: string;
  };
}
```

## Особенности

- **Автоматическая инвалидация кэша** React Query
- **Типизация** с использованием SuperDuperAI API
- **Гибкие callback'и** для обработки успеха/ошибок
- **Утилиты** для работы с данными проектов
- **Поддержка** различных сценариев использования

## Зависимости

- `@tanstack/react-query` - для управления состоянием
- `@turbo-super/api` - для работы с SuperDuperAI API








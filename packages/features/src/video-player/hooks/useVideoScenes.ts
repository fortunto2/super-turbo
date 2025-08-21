import { useState, useEffect } from "react";
import type { ISceneRead } from "@turbo-super/api";

interface UseVideoScenesReturn {
  scenes: ISceneRead[];
  isLoading: boolean;
  error: string | null;
  projectStatus: string;
  projectProgress: number;
}

export function useVideoScenes(projectId: string): UseVideoScenesReturn {
  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>("unknown");
  const [projectProgress, setProjectProgress] = useState<number>(0);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Получаем статус проекта
        const statusResponse = await fetch(
          `/api/story-editor/status?projectId=${projectId}`
        );
        const statusResult = await statusResponse.json();

        if (statusResult.success) {
          setProjectStatus(statusResult.status);
          setProjectProgress(statusResult.progress || 0);

          // Если проект завершен, получаем сцены
          if (
            statusResult.status === "completed" &&
            statusResult.project?.scenes
          ) {
            setScenes(statusResult.project.scenes);
          } else if (statusResult.status === "completed") {
            // Если сцены не в статусе, делаем отдельный запрос
            const scenesResponse = await fetch(
              `/api/story-editor/scenes?projectId=${projectId}`
            );
            const scenesResult = await scenesResponse.json();

            if (scenesResult.success && scenesResult.scenes) {
              // Фильтруем только ISceneRead (полные сцены)
              const fullScenes = scenesResult.scenes.filter(
                (scene: any) =>
                  scene.visual_description || scene.action_description
              );
              setScenes(fullScenes);
            } else {
              setError("Не удалось загрузить сцены");
            }
          }
        } else {
          setError("Не удалось получить статус проекта");
        }
      } catch (err) {
        setError("Ошибка загрузки данных проекта");
        console.error("Error fetching project data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();

    // Если проект еще не завершен, проверяем статус каждые 5 секунд
    if (projectStatus !== "completed") {
      const interval = setInterval(fetchProjectData, 5000);
      return () => clearInterval(interval);
    }
  }, [projectId, projectStatus]);

  return {
    scenes,
    isLoading,
    error,
    projectStatus,
    projectProgress,
  };
}

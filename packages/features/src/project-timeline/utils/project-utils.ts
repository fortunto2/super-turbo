import type { TimelineData } from "../types";
import type { IProjectRead, ISceneRead } from "@turbo-super/api";

/**
 * Конвертирует ISceneRead в TimelineData
 */
export function convertSceneToTimeline(scene: ISceneRead): TimelineData {
  return {
    id: scene.id,
    project_id: scene.id, // Временно используем scene.id, нужно будет исправить
    order: scene.order,
    visual_description: scene.visual_description,
    action_description: scene.action_description,
    dialogue: scene.dialogue,
    duration: scene.duration,
    file: scene.file
      ? {
          id: scene.file.id,
          url: scene.file.url || "",
          type: scene.file.type || "image",
        }
      : undefined,
  };
}

/**
 * Конвертирует массив сцен в timeline
 */
export function convertScenesToTimeline(scenes: ISceneRead[]): TimelineData[] {
  return scenes.sort((a, b) => a.order - b.order).map(convertSceneToTimeline);
}

/**
 * Получает общую длительность timeline
 */
export function getTimelineDuration(timeline: TimelineData[]): number {
  return timeline.reduce((acc, item) => acc + (item.duration || 5), 0);
}

/**
 * Создает ключи для React Query
 */
export const projectQueryKeys = {
  all: ["projects"] as const,
  byId: (id: string) => ["projects", id] as const,
  timeline: (id: string) => ["projects", id, "timeline"] as const,
  video: (id: string) => ["projects", id, "video"] as const,
};

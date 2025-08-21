import type { ISceneRead } from "@turbo-super/api";
import type { VideoScene, VideoConfig } from "../types";

/**
 * Вычисляет общую длительность видео на основе сцен
 */
export function calculateTotalDuration(scenes: ISceneRead[]): number {
  const total = scenes.reduce((acc, scene) => acc + (scene.duration || 5), 0);
  // Убеждаемся, что возвращаем целое число
  return Math.round(total);
}

/**
 * Создает временную шкалу для сцен
 */
export function createVideoTimeline(
  scenes: ISceneRead[],
  fps: number = 30
): VideoScene[] {
  return scenes.map((scene, index) => {
    const sceneDuration = scene.duration || 5;
    const startTime = scenes
      .slice(0, index)
      .reduce((acc, s) => acc + (s.duration || 5), 0);

    return {
      scene,
      startTime: startTime * fps,
      endTime: (startTime + sceneDuration) * fps,
      duration: sceneDuration * fps,
    };
  });
}

/**
 * Получает конфигурацию видео на основе соотношения сторон
 */
export function getVideoConfig(
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3"
): VideoConfig {
  const configs = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "4:3": { width: 1440, height: 1080 },
  };

  const dimensions = configs[aspectRatio];

  return {
    ...dimensions,
    fps: 30,
    duration: 0, // Будет вычислено позже
    aspectRatio,
  };
}

/**
 * Форматирует время в формате MM:SS
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Проверяет, готова ли сцена к отображению
 */
export function isSceneReady(scene: ISceneRead): boolean {
  return !!(
    scene.visual_description ||
    scene.action_description ||
    scene.dialogue ||
    scene.file
  );
}

/**
 * Получает превью для сцены
 */
export function getScenePreview(scene: ISceneRead): string | null {
  if (scene.file?.url) {
    return scene.file.url;
  }

  // Если нет файла, можно создать превью на основе описания
  return null;
}

/**
 * Вычисляет прогресс воспроизведения в процентах
 */
export function calculatePlaybackProgress(
  currentTime: number,
  totalDuration: number
): number {
  if (totalDuration === 0) return 0;
  return Math.min(100, (currentTime / totalDuration) * 100);
}

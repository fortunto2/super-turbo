export const FPS = 30;
export const transitionDuration = 10;
export const minSceneDurationInFrames = 30;

export const calculateDuration = (scenes: any[]) => {
  let totalDuration = 0;

  for (const scene of scenes ?? []) {
    const durationInFrames = scene.duration * FPS;
    totalDuration += durationInFrames;
  }

  return Math.ceil(totalDuration);
};

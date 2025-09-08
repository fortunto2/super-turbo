import type { ISceneRead } from "@turbo-super/api";

interface SceneHeaderProps {
  scene?: ISceneRead | null;
}

export function SceneHeader({ scene }: SceneHeaderProps) {
  return (
    <div className="mb-3 flex shrink-0 items-center justify-between">
      <h3 className="text-lg font-semibold text-foreground">
        Scene {scene?.order != null ? scene.order + 1 : ""}
      </h3>
      <div className="text-xs text-muted-foreground">
        Duration: {scene?.duration}
      </div>
    </div>
  );
}

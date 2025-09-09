import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";
import { Layer } from "@turbo-super/features";
import { CanvasWrapper } from "./canvas-wrapper";
import { MediaPreview } from "./media-preview";

interface CanvasContainerProps {
  scene: ISceneRead;
  canvasSize: { width: number; height: number };
  activeTool: string | null;
  onPlayingChange?: (value: boolean) => void;
  isPlaying?: boolean;
  isReady: boolean;
  updateCanvasSize: () => void;
  onToolbarUpdate: (target?: any) => void;
  setCanvas: (canvas: any) => void;
}

export function CanvasContainer({
  scene,
  canvasSize,
  activeTool,
  onPlayingChange,
  isPlaying,
  isReady,
  updateCanvasSize,
  onToolbarUpdate,
  setCanvas,
}: CanvasContainerProps) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div
        className="relative max-w-full"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      >
        <MediaPreview
          scene={scene}
          canvasSize={canvasSize}
          onPlayingChange={onPlayingChange}
          isPlaying={isPlaying}
          isReady={isReady}
          updateCanvasSize={updateCanvasSize}
        />

        <Layer
          active={activeTool === "inpainting"}
          setCanvas={setCanvas}
          imageUrl={scene.file?.url!}
        />

        {activeTool !== "inpainting" &&
          canvasSize.width > 0 &&
          canvasSize.height > 0 && (
            <CanvasWrapper
              sceneId={scene.id}
              width={canvasSize.width}
              height={canvasSize.height}
              onToolbarUpdate={onToolbarUpdate}
            />
          )}
      </div>
    </div>
  );
}

import { useMediaPrefetch, TextToolbar } from "@turbo-super/features";
import { ToolType } from "./toolbar";
import { useMemo, useRef } from "react";
import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";
import { EmptyPreview, ErrorMessage, Loader } from "./helper";
import { CanvasContainer } from "./canvas-container";
import { InpaintingPanel } from "./inpainting-panel";
import { useCanvasSize } from "../hooks/use-canvas-size";
import { useToolbar } from "../hooks/use-toolbar";
import { useInpainting } from "../hooks/use-inpainting";

interface ScenePreviewProps {
  scene?: ISceneRead | null;
  isLoading: boolean;
  error: string | null;
  activeTool: string | null;
  onActiveToolChange?: (tool: ToolType | null) => void;
  onPlayingChange?: (value: boolean) => void;
  onStarted: (id: string) => void;
  isPlaying?: boolean;
  projectId: string;
  controllerRef: any;
}

export const ScenePreview = ({
  scene,
  isLoading,
  error,
  activeTool,
  onActiveToolChange,
  onPlayingChange,
  onStarted,
  isPlaying,
  projectId,
  controllerRef,
}: ScenePreviewProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { canvasSize, updateCanvasSize } = useCanvasSize({
    scene,
    activeTool,
    containerRef,
    toolbarRef,
  });

  const { toolbarVisible, setToolbarVisible, updateToolbarAnchorFromTarget } =
    useToolbar({
      controllerRef,
    });

  const { isInpainting, canvas, setCanvas, handleInpainting } = useInpainting({
    scene,
    projectId,
    onActiveToolChange,
    onStarted,
  });

  const filesScene: any = useMemo(() => {
    // if (!scene || !project) return [];
    if (!scene) return [];
    return [
      { url: scene.voiceover?.url, type: FileTypeEnum.AUDIO },
      { url: scene.sound_effect?.url, type: FileTypeEnum.AUDIO },
      // { url: project.music?.file.url, type: FileTypeEnum.MUSIC },
      { url: scene.file?.url, type: FileTypeEnum.VIDEO },
    ].filter(({ url }) => url);
  }, [scene]);

  const { loaded: isReady } = useMediaPrefetch({ files: filesScene });

  const containerHeight = useMemo(() => {
    return activeTool === null || activeTool === "inpainting" ? "100%" : "60%";
  }, [activeTool]);

  return (
    <div
      style={{ height: containerHeight }}
      className="flex items-center justify-center overflow-hidden rounded-lg bg-black relative gap-3 transition-[height] duration-300 ease-in-out"
      ref={containerRef}
    >
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : scene?.file?.url ? (
        <CanvasContainer
          scene={scene}
          canvasSize={canvasSize}
          activeTool={activeTool}
          onPlayingChange={onPlayingChange}
          isPlaying={isPlaying}
          isReady={isReady}
          updateCanvasSize={updateCanvasSize}
          controllerRef={controllerRef}
          onToolbarUpdate={updateToolbarAnchorFromTarget}
          setCanvas={setCanvas}
        />
      ) : (
        <EmptyPreview />
      )}

      {/* Floating text toolbar */}
      {toolbarVisible && controllerRef.current && (
        <TextToolbar
          controller={controllerRef.current}
          visible={toolbarVisible}
          onClose={() => setToolbarVisible(false)}
        />
      )}

      <InpaintingPanel
        activeTool={activeTool}
        isLoading={isLoading}
        isInpainting={isInpainting}
        canvas={canvas}
        setCanvas={setCanvas}
        onComplete={handleInpainting}
        onActiveChange={(tool: ToolType) => onActiveToolChange?.(tool)}
        toolbarRef={toolbarRef}
      />
    </div>
  );
};

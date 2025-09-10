import {
  useMediaPrefetch,
  TextToolbar,
  type FabricControllerType,
} from "@turbo-super/features";
import type { ToolType } from "./toolbar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileTypeEnum, } from "@turbo-super/api";
import { EmptyPreview, } from "./helper";
import { CanvasContainer } from "./canvas-container";
import { InpaintingPanel } from "./inpainting-panel";
import { ScenePreviewSkeleton } from "./scene-preview-skeleton";
import { useCanvasSize } from "../hooks/use-canvas-size";
import { useInpainting } from "../hooks/use-inpainting";
import { useToolbarStore } from "@/lib/store";
import { useSceneGetById } from "@/lib/api";

interface ScenePreviewProps {
  activeTool: string | null;
  onActiveToolChange?: (tool: ToolType | null | string) => void;
  onPlayingChange?: (value: boolean) => void;
  onStarted: (id: string) => void;
  isPlaying?: boolean;
  projectId: string;
  sceneId: string;
}

export const ScenePreview = ({
  activeTool,
  onActiveToolChange,
  onPlayingChange,
  onStarted,
  isPlaying,
  projectId,
  sceneId,
}: ScenePreviewProps) => {
  const { data: scene, isLoading } = useSceneGetById({ id: sceneId });

  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [toolbarVisible, setToolbarVisible] = useState(false);

  const { controller } = useToolbarStore();

  const { canvasSize, updateCanvasSize } = useCanvasSize({
    scene,
    activeTool,
    containerRef,
    toolbarRef,
  });

  const { isInpainting, canvas, setCanvas, handleInpainting } = useInpainting({
    scene,
    projectId,
    onActiveToolChange,
    onStarted,
  });

  const updateToolbarAnchorFromTarget = useCallback(
    (target?: FabricControllerType) => {
      if (!controller) return;
      const textbox = target ?? controller.getActiveText();
      if (!textbox) {
        setToolbarVisible(false);
        return;
      }
      setToolbarVisible(true);
    },
    [controller]
  );

  // Scroll listener for toolbar positioning
  useEffect(() => {
    const onScroll = () => {
      if (!toolbarVisible) return;
      updateToolbarAnchorFromTarget();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [toolbarVisible, updateToolbarAnchorFromTarget]);

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
        <ScenePreviewSkeleton />
      ) : scene?.file?.url ? (
        <CanvasContainer
          scene={scene!}
          canvasSize={canvasSize}
          activeTool={activeTool}
          onPlayingChange={onPlayingChange}
          isPlaying={isPlaying}
          isReady={isReady}
          updateCanvasSize={updateCanvasSize}
          onToolbarUpdate={updateToolbarAnchorFromTarget}
          setCanvas={setCanvas}
        />
      ) : (
        <EmptyPreview />
      )}

      {/* Floating text toolbar */}
      {toolbarVisible && controller && (
        <TextToolbar
          controller={controller}
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
        onActiveChange={(tool: ToolType | string | null) =>
          onActiveToolChange?.(tool)
        }
        toolbarRef={toolbarRef}
      />
    </div>
  );
};

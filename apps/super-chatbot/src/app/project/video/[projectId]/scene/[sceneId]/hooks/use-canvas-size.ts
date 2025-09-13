import { useCallback, useEffect, useState } from "react";
import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";

interface UseCanvasSizeProps {
  scene?: ISceneRead | null;
  activeTool: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
  toolbarRef: React.RefObject<HTMLDivElement>;
}

export function useCanvasSize({
  scene,
  activeTool,
  containerRef,
  toolbarRef,
}: UseCanvasSizeProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const toolbar = toolbarRef.current;

    if (!container || !scene?.file?.url) return;

    const containerWidth = container.clientWidth || 0;
    const containerHeight = container.clientHeight || 0;
    const toolbarWidth = toolbar?.clientWidth || 0;

    if (!containerWidth || !containerHeight) return;

    // Создаем временный элемент для получения размеров
    const tempElement = document.createElement(
      scene.file.type === FileTypeEnum.IMAGE ? "img" : "video"
    );

    const handleLoad = () => {
      const naturalWidth =
        scene.file?.type === FileTypeEnum.IMAGE
          ? (tempElement as HTMLImageElement).naturalWidth
          : (tempElement as HTMLVideoElement).videoWidth ||
            (tempElement as HTMLVideoElement).offsetWidth ||
            0;

      const naturalHeight =
        scene.file?.type === FileTypeEnum.IMAGE
          ? (tempElement as HTMLImageElement).naturalHeight
          : (tempElement as HTMLVideoElement).videoHeight ||
            (tempElement as HTMLVideoElement).offsetHeight ||
            0;

      if (!naturalWidth || !naturalHeight) return;

      const scale = Math.min(
        (containerWidth - toolbarWidth) / naturalWidth,
        containerHeight / naturalHeight
      );
      const width = Math.floor(naturalWidth * scale);
      const height = Math.floor(naturalHeight * scale);
      setCanvasSize({ width, height });
    };

    if (scene.file.type === FileTypeEnum.IMAGE) {
      tempElement.onload = handleLoad;
    } else {
      tempElement.onloadedmetadata = handleLoad;
    }

    tempElement.src = scene.file.url;
  }, [scene?.file?.url, scene?.file?.type, containerRef, toolbarRef]);

  // Recalculate when activeTool changes (container height may change)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCanvasSize();
    }, 350); // 300ms анимация + 50ms буфер

    return () => clearTimeout(timer);
  }, [activeTool, updateCanvasSize]);

  // Observe container size changes to recompute contain fit precisely
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateCanvasSize();
      }, 50);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [updateCanvasSize, containerRef]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  // Update canvas size when scene changes
  useEffect(() => {
    if (scene?.file?.url) {
      updateCanvasSize();
    }
  }, [scene?.file?.url, updateCanvasSize]);

  return { canvasSize, updateCanvasSize };
}

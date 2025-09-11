"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas } from "fabric";
import { Control } from "@turbo-super/features";
import { Button } from "@turbo-super/ui";
import { X } from "lucide-react";

interface SceneInpaintingProps {
  imageUrl: string;
  onComplete: (result: { prompt: string; mask: File; config: string }) => void;
  onClose: () => void;
  loading?: boolean;
}

export function SceneInpainting({
  imageUrl,
  onComplete,
  onClose,
  loading,
}: SceneInpaintingProps) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width,
      height,
      isDrawingMode: false,
    });

    setCanvas(fabricCanvas);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newRect = container.getBoundingClientRect();
      const newWidth = newRect.width;
      const newHeight = newRect.height;

      if (newWidth !== 0 && newHeight !== 0) {
        fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
        fabricCanvas.renderAll();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.disconnect();
      void fabricCanvas.dispose();
      setCanvas(null);
    };
  }, []);

  const handleActiveChange = (tool: string | null) => {
    setIsActive(tool === "inpainting");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Inpainting</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Canvas overlay positioned over the scene image */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: isActive ? 10 : -1,
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{
              opacity: isActive ? 0.5 : 0,
              display: "block",
            }}
          />
        </div>

        {/* Control panel for inpainting tools */}
        <div className="absolute bottom-4 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <Control
            onGenerating={() => {}}
            isActive={isActive}
            canvas={canvas}
            setCanvas={setCanvas}
            onComplete={onComplete}
            loading={loading}
            initialPrompt=""
            onActiveChange={handleActiveChange}
          />
        </div>
      </div>
    </div>
  );
}

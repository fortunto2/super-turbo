"use client";

import type { FC } from "react";
import { useEffect, useRef } from "react";
import { Canvas } from "fabric";

export const Layer: FC<{
  active?: boolean;
  setCanvas: (canvas: Canvas | null) => void;
  imageUrl?: string;
}> = ({ active, setCanvas, imageUrl }) => {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get real container dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    console.log("Creating canvas with dimensions:", { width, height });

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

      console.log("Canvas resized to:", { newWidth, newHeight });

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
  }, [canvasRef]);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: active ? 10 : -1,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <div
        className="w-full h-full"
        ref={containerRef}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{
            opacity: 0.5,
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

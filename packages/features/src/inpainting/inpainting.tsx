import { Layer } from "./layer";
import { useState, useEffect } from "react";
import { Canvas } from "fabric";
import { Control } from "./control";

export const Inpainting = ({
  imageUrl,
  onGenerating,
  onComplete,
  initialPrompt = "",
}: {
  imageUrl: string;
  onGenerating?: () => void;
  onComplete?: (result: { prompt: string; mask: File; config: string }) => void;
  initialPrompt?: string;
}) => {
  const [activeTool, setActiveTool] = useState<string>("inpainting");
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveTool("inpainting");
  }, []);

  useEffect(() => {
    if (canvas) {
      console.log("Canvas is ready");
    }
  }, [canvas]);

  const handleGenerating = () => {
    setIsLoading(true);
    onGenerating?.();
  };

  const handleComplete = (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    setIsLoading(false);
    onComplete?.(result);
  };

  const handleActiveToolChange = (tool: string) => {
    setActiveTool(tool);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Центральная область с фоновым изображением и canvas поверх */}
      <div
        className="flex-1 relative min-h-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg m-4 shadow-sm"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Canvas накладывается поверх изображения */}
        <Layer
          active={activeTool === "inpainting"}
          setCanvas={setCanvas}
          imageUrl={imageUrl}
        />
      </div>

      {/* Правая панель с инструментами */}
      <div className="w-full lg:w-80 lg:min-w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Control
          onGenerating={handleGenerating}
          isActive={activeTool === "inpainting"}
          canvas={canvas}
          setCanvas={setCanvas}
          onComplete={handleComplete}
          loading={isLoading}
          initialPrompt={initialPrompt}
          onActiveChange={handleActiveToolChange}
        />
      </div>
    </div>
  );
};

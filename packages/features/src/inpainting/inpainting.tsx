import { Layer } from "./layer";
import { useState, useEffect } from "react";
import { Canvas } from "fabric";
import { Control } from "./control";

export const Inpainting = ({
  imageUrl,
  onGenerating,
  onComplete,
  initialPrompt = "",
  isGenerating = false,
}: {
  imageUrl: string;
  onGenerating?: () => void;
  onComplete?: (result: { prompt: string; mask: File; config: string }) => void;
  initialPrompt?: string;
  isGenerating?: boolean;
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    canvas?.clear();
  };

  // Use external isGenerating or internal isLoading
  const currentLoading = isGenerating || isLoading;

  const handleActiveToolChange = (tool: string | null) => {
    setActiveTool(tool);
  };

  return (
    <div className="w-full h-full flex flex-row bg-gray-50 dark:bg-gray-900">
      {/* Central area with background image and canvas overlay */}
      <div
        className="flex-1 relative min-h-[550px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg m-4 shadow-sm"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Canvas overlays the image */}
        <Layer
          active={activeTool === "inpainting"}
          setCanvas={setCanvas}
          imageUrl={imageUrl}
        />
      </div>

      {/* Right panel with tools */}
      <div className=" w-80 lg:min-w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Control
          onGenerating={handleGenerating}
          isActive={activeTool === "inpainting"}
          canvas={canvas}
          setCanvas={setCanvas}
          onComplete={handleComplete}
          loading={currentLoading}
          initialPrompt={initialPrompt}
          onActiveChange={handleActiveToolChange}
        />
      </div>
    </div>
  );
};

"use client";

import { InpaintingTools } from "./inpainting-tools";
import { InpaintingForm } from "./inpainting-form";
import { Canvas } from "fabric";

type Props = {
  onGenerating?: () => void;
  isActive?: boolean;
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  onComplete?: (result: { prompt: string; mask: File; config: string }) => void;
  loading?: boolean;
  initialPrompt?: string;
  onActiveChange?: (tool: string) => void;
};

export const Control = ({
  onGenerating,
  isActive,
  canvas,
  setCanvas,
  onComplete,
  loading = false,
  initialPrompt = "",
  onActiveChange,
}: Props) => {
  const handleInpainting = async (
    prompt: string,
    mask: File,
    generationConfig: string
  ) => {
    onComplete?.({ prompt, mask, config: generationConfig });
  };

  const handleActiveChange = (tool: string) => {
    onActiveChange?.(tool);
  };

  return (
    <div
      className="h-full overflow-hidden"
      style={{
        height: isActive ? "100%" : "85px",
        transition: "height 0.25s ease-in-out",
      }}
    >
      <div className="size-full bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex flex-col justify-between gap-5 items-start h-full w-full p-4">
          <InpaintingTools
            active={isActive}
            onActiveChange={handleActiveChange}
            canvas={canvas}
            isCombined={isActive}
            onClose={() => {}}
          />

          {isActive && (
            <InpaintingForm
              canvas={canvas}
              onComplete={handleInpainting}
              loading={loading}
              initialPrompt={initialPrompt}
            />
          )}
        </div>
      </div>
    </div>
  );
};

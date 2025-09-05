import { Control } from "@turbo-super/features";
import { ToolType } from "./toolbar";

interface InpaintingPanelProps {
  activeTool: string | null;
  isLoading: boolean;
  isInpainting: boolean;
  canvas: any;
  setCanvas: (canvas: any) => void;
  onComplete: (result: { prompt: string; mask: File; config: string }) => void;
  onActiveChange: (tool: ToolType) => void;
  toolbarRef: React.RefObject<HTMLDivElement>;
}

export function InpaintingPanel({
  activeTool,
  isLoading,
  isInpainting,
  canvas,
  setCanvas,
  onComplete,
  onActiveChange,
  toolbarRef,
}: InpaintingPanelProps) {
  if (activeTool !== "inpainting") return null;

  return (
    <div
      ref={toolbarRef}
      className="h-full w-full lg:w-96 lg:min-w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <Control
        onGenerating={() => {
          // This will be handled by parent
        }}
        isActive={activeTool === "inpainting"}
        canvas={canvas}
        setCanvas={setCanvas}
        onComplete={onComplete}
        loading={isLoading || isInpainting}
        initialPrompt=""
        onActiveChange={onActiveChange}
      />
    </div>
  );
}

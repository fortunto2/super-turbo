import { Control } from '@turbo-super/features';
import type { ToolType } from './toolbar';
import { cn } from '@turbo-super/ui';

interface InpaintingPanelProps {
  activeTool: string | null;
  isLoading: boolean;
  isInpainting: boolean;
  canvas: any;
  setCanvas: (canvas: any) => void;
  onComplete: (result: { prompt: string; mask: File; config: string }) => void;
  onActiveChange: (tool: ToolType | null | string) => void;
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
  return (
    <div
      ref={toolbarRef}
      className={cn('h-full transition-all duration-500', {
        'lg:w-96 lg:min-w-80 w-full p-4 dark:border-gray-700 bg-white dark:bg-gray-900 border-l border-gray-200':
          activeTool === 'inpainting',
        'w-0': activeTool !== 'inpainting',
      })}
    >
      <Control
        onGenerating={() => {
          // This will be handled by parent
        }}
        isActive={activeTool === 'inpainting'}
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

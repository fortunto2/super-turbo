import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";
import { Skeleton } from "@turbo-super/ui";
import {
  Download,
  Image as ImageIcon,
  MicVocal,
  AudioLines,
  Sparkles,
  Palette,
  Type,
  Play,
  Pause,
} from "lucide-react";

export type ToolType =
  | "none"
  | "mediaList"
  | "voiceover"
  | "soundEffect"
  | "animating"
  | "inpainting"
  | "lipsync"
  | "addText";

export function Toolbar({
  scene,
  activeTool,
  isPlaying,
  onDownload,
  onChangeTool,
  togglePlay,
  isLoading,
  onAddText,
}: {
  scene?: ISceneRead | null;
  activeTool: ToolType | null;
  isPlaying: boolean;
  onDownload: () => void;
  onChangeTool: (tool: ToolType | null) => void;
  togglePlay: () => void;
  isLoading?: boolean;
  onAddText: () => void;
}) {
  const tools = [
    {
      icon: <Download className="size-5" />,
      content: "Download",
      onClick: onDownload,
      hidden: !scene?.file?.url,
      type: null,
    },
    {
      icon: <ImageIcon className="size-5" />,
      content: "Edit media",
      onClick: () =>
        onChangeTool(activeTool === "mediaList" ? null : "mediaList"),
      hidden: !scene,
      type: "mediaList" as ToolType,
    },
    {
      icon: <MicVocal className="size-5" />,
      content: "Voiceover",
      onClick: () =>
        onChangeTool(activeTool === "voiceover" ? null : "voiceover"),
      hidden: !scene,
      type: "voiceover" as ToolType,
    },
    {
      icon: <AudioLines className="size-5" />,
      content: "Sound effect",
      onClick: () =>
        onChangeTool(activeTool === "soundEffect" ? null : "soundEffect"),
      hidden: !scene,
      type: "soundEffect" as ToolType,
    },
    {
      icon: <Sparkles className="size-5" />,
      content: "Animating",
      onClick: () =>
        onChangeTool(activeTool === "animating" ? null : "animating"),
      hidden: scene?.file?.type !== FileTypeEnum.IMAGE,
      type: "animating" as ToolType,
    },
    {
      icon: <Palette className="size-5" />,
      content: "Inpainting",
      onClick: () =>
        onChangeTool(activeTool === "inpainting" ? null : "inpainting"),
      hidden: scene?.file?.type !== FileTypeEnum.IMAGE,
      type: "inpainting" as ToolType,
    },
    {
      icon: <Type className="size-5" />,
      content: "Add text",
      onClick: onAddText,
      hidden: !scene,
      type: "addText" as ToolType,
    },
    {
      icon: isPlaying ? (
        <Pause className="size-5" />
      ) : (
        <Play className="size-5" />
      ),
      content: isPlaying ? "Pause" : "Play",
      onClick: togglePlay,
      hidden: scene?.file?.type !== FileTypeEnum.VIDEO,
      type: null,
    },
  ];

  return (
    <aside className="w-[78px] shrink-0 bg-card border border-border rounded-xl p-2 flex flex-col items-center gap-2">
      {isLoading
        ? [...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="size-12 rounded-lg"
            />
          ))
        : tools
            .filter((t) => !t.hidden)
            .map((t, idx) => {
              const isActive = t.type && t.type === activeTool;
              return (
                <button
                  key={idx}
                  onClick={t.onClick}
                  className={`relative size-12 rounded-lg border hover:border-primary/60 grid place-items-center ${
                    isActive ? "border-gray-400" : "border-border"
                  }`}
                  title={t.content}
                >
                  {t.icon}
                </button>
              );
            })}
    </aside>
  );
}

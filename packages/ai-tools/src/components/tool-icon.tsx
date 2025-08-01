import React from "react";
import {
  ImageIcon,
  VideoIcon,
  Wand2Icon,
  SparklesIcon,
  ZapIcon,
  PlayIcon,
  LanguagesIcon,
  ImagesIcon,
} from "lucide-react";
import { cn } from "@turbo-super/ui";

interface ToolIconProps {
  name:
    | "image"
    | "video"
    | "wand"
    | "sparkles"
    | "zap"
    | "play"
    | "languages"
    | "gallery";
  className?: string;
}

const iconMap = {
  image: ImageIcon,
  video: VideoIcon,
  wand: Wand2Icon,
  sparkles: SparklesIcon,
  zap: ZapIcon,
  play: PlayIcon,
  languages: LanguagesIcon,
  gallery: ImagesIcon,
};

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Unknown icon name: ${name}`);
    return null;
  }

  return <IconComponent className={cn("size-4", className)} />;
};

import type { ISceneRead } from "@turbo-super/api";

export interface VideoPlayerProps {
  projectId: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
}

export interface SceneRendererProps {
  scenes: ISceneRead[];
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  duration?: number;
  fps?: number;
}

export interface VideoScene {
  scene: ISceneRead;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
}

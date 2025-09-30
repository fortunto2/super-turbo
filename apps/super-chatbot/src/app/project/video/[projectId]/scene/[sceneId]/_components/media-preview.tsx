import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";
import { useRef } from "react";
import { VideoPreview } from "./video-preview";

interface MediaPreviewProps {
  scene: ISceneRead;
  canvasSize: { width: number; height: number };
  onPlayingChange?: (value: boolean) => void;
  isPlaying?: boolean;
  isReady: boolean;
  updateCanvasSize: () => void;
}

export function MediaPreview({
  scene,
  canvasSize,
  onPlayingChange,
  isPlaying,
  isReady,
  updateCanvasSize,
}: MediaPreviewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="relative max-w-full"
      style={{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
      }}
    >
      {scene.file?.type === FileTypeEnum.IMAGE && scene.file.url ? (
        <img
          src={scene.file.url}
          alt={`Scene ${scene.id}`}
          className="absolute inset-0 w-full h-full object-contain"
          ref={imgRef}
          onLoad={updateCanvasSize}
        />
      ) : scene.file?.type === FileTypeEnum.VIDEO &&
        scene.file.url &&
        scene.duration ? (
        <VideoPreview
          url={scene.file.url}
          onPlayingChange={onPlayingChange ?? (() => {})}
          duration={scene.duration}
          isPlaying={isPlaying}
          musicSrc={scene.sound_effect?.url}
          soundEffectSrc={scene.sound_effect?.url}
          voiceoverSrc={scene.voiceover?.url}
          isReady={isReady}
          videoRef={videoRef}
          updateCanvasSize={updateCanvasSize}
        />
      ) : null}
    </div>
  );
}

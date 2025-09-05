import { FileTypeEnum, type ISceneRead } from "@turbo-super/api";
import type { IFileRead } from "@/lib/api/models/IFileRead";
import type { ToolType } from "./toolbar";
import { AnimatingTool } from "./animating-tool";
import { SoundEffectList } from "./soundeffect-list";
import { MediaList } from "./media-list";
import { VoiceoverList } from "./voiceover-list";

interface SceneContentProps {
  activeTool: ToolType | null;
  files: IFileRead[];
  scene: ISceneRead | null;
  isLoading: boolean;
  onSelect: (file: IFileRead, isPlaceholder?: boolean) => void;
  onDelete: (fileId: string) => void;
  onStarted: (newFileId: string) => void;
  projectId: string;
  sceneId: string;
}

export function SceneContent({
  activeTool,
  files,
  scene,
  isLoading,
  onSelect,
  onDelete,
  onStarted,
  projectId,
  sceneId,
}: SceneContentProps) {
  if (activeTool === "mediaList") {
    return (
      <MediaList
        files={files}
        scene={scene}
        onSelect={onSelect}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    );
  }

  if (activeTool === "voiceover") {
    return (
      <VoiceoverList
        files={files}
        scene={scene}
        onSelect={onSelect}
        isLoading={isLoading}
      />
    );
  }

  if (activeTool === "soundEffect") {
    return (
      <SoundEffectList
        files={files}
        scene={scene}
        onSelect={onSelect}
        isLoading={isLoading}
      />
    );
  }

  if (activeTool === "animating") {
    return (
      <AnimatingTool
        sceneId={sceneId}
        projectId={projectId}
        imageUrl={scene?.file?.url}
        onStarted={onStarted}
      />
    );
  }

  return null;
}

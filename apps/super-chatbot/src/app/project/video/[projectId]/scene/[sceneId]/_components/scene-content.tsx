import { FileTypeEnum, IFileRead, type ISceneRead } from "@turbo-super/api";
import type { ToolType } from "./toolbar";
import { AnimatingTool } from "./animating-tool";
import { SoundEffectList } from "./soundeffect-list";
import { MediaList } from "./media-list";
import { VoiceoverList } from "./voiceover-list";
import { useRouter } from "next/navigation";

interface SceneContentProps {
  activeTool: ToolType | null;
  files: IFileRead[];
  scene?: ISceneRead | null;
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
  const router = useRouter();
  const handleCreateVoiceover = () => {
    router.push(`/project/video/${projectId}/scene/${sceneId}/voiceover`);
  };
  const handleCreateSoundEffect = () => {
    router.push(`/project/video/${projectId}/scene/${sceneId}/soundEffect`);
  };
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
        onCreateAudio={handleCreateVoiceover}
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
        onCreateAudio={handleCreateSoundEffect}
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

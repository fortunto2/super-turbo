"use client";

import { useParams, useRouter } from "next/navigation";

import { AudioTypeEnum, type IFileRead } from "@turbo-super/api";

import { ArrowLeft } from "lucide-react";
import { FileAudioGenerate } from "../voiceover/_components/file-audio-generate";
import { useSceneGetById, useSceneUpdate } from "@/lib/api";

const SceneSoundEffectGenerationPage = () => {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const { data: scene } = useSceneGetById({ id: sceneId });
  const updateScene = useSceneUpdate();

  const handleComplete = async (file?: IFileRead) => {
    router.push(`/project/video/${projectId}/scene/${sceneId}`);
    if (!scene || !scene.file_id) return;
    await updateScene.mutateAsync({
      id: scene.id,
      requestBody: {
        ...scene,
        file_id: scene.file_id,
        sound_effect_id: file?.id ?? null,
      },
    });
  };

  const backHref = `/project/video/${projectId}/scene/${sceneId}`;

  return (
    <div className="size-full flex-1 flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(backHref)}
          className="inline-flex items-center px-3 h-10 rounded-md border bg-secondary text-secondary-foreground text-sm hover:bg-secondary/90"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to scene
        </button>
      </div>

      <div className="flex-1 overflow-auto size-full">
        <FileAudioGenerate
          onComplete={handleComplete}
          projectId={projectId}
          sceneId={sceneId}
          type={AudioTypeEnum.SOUND_EFFECT}
        />
      </div>
    </div>
  );
};

export default SceneSoundEffectGenerationPage;

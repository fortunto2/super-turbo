"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Toolbar, type ToolType } from "./_components/toolbar";

import { ScenePreview } from "./_components/scene-preview";

import { useSceneGetById } from "@/lib/api/superduperai";

import { MediaList } from "./_components/media-list";
import { VoiceoverList } from "./_components/voiceover-list";
import { SoundEffectList } from "./_components/soundeffect-list";
import { AnimatingTool } from "./_components/animating-tool";

export default function ScenePage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [activeTool, setActiveTool] = useState<ToolType | null | string>(
    "mediaList"
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: scene, isLoading: sceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const handleChangeTool = (tool: ToolType | null) => setActiveTool(tool);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleStarted = (newFileId: string) => {
    setActiveTool("mediaList");
  };

  return (
    <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border bg-card p-4">
      {/* Left: scene preview & content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Scene {scene?.order != null ? scene.order + 1 : ""}
          </h3>
          <div className="text-xs text-muted-foreground">
            Duration: {scene?.duration}
          </div>
        </div>

        <ScenePreview
          activeTool={activeTool}
          onActiveToolChange={setActiveTool}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          projectId={projectId}
          onStarted={handleStarted}
          sceneId={sceneId}
        />

        <div className="mt-4 flex-1 overflow-hidden">
          {activeTool === "mediaList" ? (
            <MediaList
              projectId={projectId}
              sceneId={sceneId}
            />
          ) : activeTool === "voiceover" ? (
            <VoiceoverList
              projectId={projectId}
              sceneId={sceneId}
              onCreateAudio={() => {
                router.push(
                  `/project/video/${projectId}/scene/${sceneId}/voiceover`
                );
              }}
            />
          ) : activeTool === "soundEffect" ? (
            <SoundEffectList
              projectId={projectId}
              sceneId={sceneId}
              onCreateAudio={() => {
                router.push(
                  `/project/video/${projectId}/scene/${sceneId}/soundEffect`
                );
              }}
            />
          ) : activeTool === "animating" ? (
            <AnimatingTool
              sceneId={sceneId}
              projectId={projectId}
              imageUrl={scene?.file?.url}
              onStarted={handleStarted}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <Toolbar
        scene={scene}
        isPlaying={isPlaying}
        activeTool={activeTool}
        onChangeTool={handleChangeTool}
        togglePlay={togglePlay}
        isLoading={sceneLoading}
      />
    </div>
  );
}

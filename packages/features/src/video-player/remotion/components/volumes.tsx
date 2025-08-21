"use client";

import { memo, type FC } from "react";
import { Audio, Series } from "remotion";
import { AudioPlayer } from "./audio-player";
import { FPS, minSceneDurationInFrames, transitionDuration } from "../utils";

type Props = {
  scenes?: any[];
  musicUrl?: string | null;
};

const Volumes: FC<Props> = ({ scenes, musicUrl }) => {
  return (
    <>
      <Series>
        {scenes?.map((scene, index) => {
          const sceneDurationInFrames = scene.duration * FPS;
          const durationWithTransition =
            sceneDurationInFrames > minSceneDurationInFrames
              ? sceneDurationInFrames - transitionDuration
              : sceneDurationInFrames;

          return (
            <Series.Sequence
              durationInFrames={durationWithTransition}
              premountFor={10}
              key={index}
            >
              {scene.sound_effect?.url && (
                <Audio
                  src={scene.sound_effect.url}
                  volume={0.3}
                />
              )}

              {scene.voiceover?.url &&
                scene.file?.video_generation?.generation_config_name !==
                  "comfyui/lip-sync" && (
                  <Audio
                    src={scene.voiceover.url}
                    volume={1}
                  />
                )}
            </Series.Sequence>
          );
        })}
      </Series>

      {musicUrl && (
        <AudioPlayer
          src={musicUrl}
          volume={0.4}
        />
      )}
    </>
  );
};

export const VolumesComponent = memo(Volumes);

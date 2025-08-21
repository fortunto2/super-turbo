"use client";

import type { FC } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { Player } from "@remotion/player";
import { calculateDuration, FPS } from "./utils";
import { VideoComponent } from "./components/video-component";

type Props = {
  scenes?: any[];
  music?: any;
  aspectRatio?: number;
  isLoading?: boolean;
};

const VideoPlayer: FC<Props> = ({
  scenes,
  music,
  aspectRatio = 16 / 9,
  isLoading,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);

  const [metadata, setMetadata] = useState<{
    durationInFrames: number;
    compositionWidth: number;
    compositionHeight: number;
    fps: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      let compositionWidth;
      let compositionHeight;

      if (containerWidth / aspectRatio <= containerHeight) {
        compositionWidth = containerWidth;
        compositionHeight = containerWidth / aspectRatio;
      } else {
        compositionHeight = containerHeight;
        compositionWidth = containerHeight * aspectRatio;
      }

      if (!compositionWidth || !compositionHeight) return;

      const totalDuration = calculateDuration(scenes || []);

      setMetadata({
        durationInFrames: totalDuration,
        fps: FPS,
        compositionWidth: Math.round(compositionWidth - 5),
        compositionHeight: Math.round(compositionHeight - 5),
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, scenes]);

  const inputProps = {
    scenes,
    musicUrl: music?.file?.url,
  };

  const renderPlayPauseButton = useCallback(() => {
    if (isLoading) {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          title="Loading"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        </div>
      );
    }
    return null;
  }, [isLoading]);

  return (
    <div className="grow p-3 pt-6 w-full h-full">
      <div
        ref={containerRef}
        className="flex-1 flex justify-center items-center relative w-full h-full"
      >
        {metadata && (
          <Player
            ref={playerRef}
            {...metadata}
            component={() => VideoComponent(inputProps)}
            renderPlayPauseButton={renderPlayPauseButton}
            clickToPlay={!isLoading}
            numberOfSharedAudioTags={10}
            controls={true}
            moveToBeginningWhenEnded={false}
          />
        )}
      </div>
    </div>
  );
};

export const RemotionPlayer = memo(VideoPlayer);

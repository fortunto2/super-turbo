"use client";

import { useEffect, useRef } from "react";
import type { PlayerRef } from "@remotion/player";
import { Player as RemotionPlayer } from "@remotion/player";
import { useStore, Composition } from "super-timeline";

export const Player = () => {
  const playerRef = useRef<PlayerRef>(null);
  const { setPlayerRef, duration, fps, size } = useStore();

  useEffect(() => {
    setPlayerRef(playerRef as any);
  }, []);

  return (
    <div className="size-full flex">
      <RemotionPlayer
        ref={playerRef as any}
        component={Composition}
        durationInFrames={Math.round((duration / 1000) * fps) || 5 * 30}
        compositionWidth={size.width}
        compositionHeight={size.height}
        style={{ width: "100%", height: "400px" }}
        fps={fps}
        overflowVisible
        numberOfSharedAudioTags={10}
      />
    </div>
  );
};

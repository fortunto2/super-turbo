"use client";

import { Player } from "./player";

export const Scene = () => {
  return (
    <div className="bg-scene py-3 size-full flex justify-center flex-1">
      <div className="max-w-3xl flex-1 size-full flex relative">
        <Player />
      </div>
    </div>
  );
};

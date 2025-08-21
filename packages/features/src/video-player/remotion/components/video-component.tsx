import { type FC } from "react";
import { AbsoluteFill } from "remotion";

import { Scenes } from "./scenes";
import { VolumesComponent } from "./volumes";

type Props = {
  scenes?: any[];
  musicUrl?: string | null;
};

export const VideoComponent: FC<Props> = ({ scenes, musicUrl }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black", position: "relative" }}>
      <Scenes scenes={scenes} />
      <VolumesComponent
        musicUrl={musicUrl}
        scenes={scenes}
      />
    </AbsoluteFill>
  );
};

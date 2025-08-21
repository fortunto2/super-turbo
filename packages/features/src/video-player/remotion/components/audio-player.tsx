import { type FC } from "react";
import { Audio } from "remotion";

type Props = {
    src: string;
    volume?: number;
};

export const AudioPlayer: FC<Props> = ({ src, volume = 0.4 }) => {
    return (
        <Audio
            src={src}
            volume={volume}
        />
    );
};

"use client";

import { memo, type FC } from "react";
import { Img, OffthreadVideo } from "remotion";

type Props = {
    url?: string | null;
    type?: string;
    playbackRate?: number;
};

const SceneComponent: FC<Props> = ({ type, url, playbackRate = 1 }) => {
    if (!url) return null;

    return type === "video" ? (
        <OffthreadVideo
            src={url}
            className="size-full object-cover"
            playbackRate={playbackRate}
        />
    ) : (
        <Img
            src={url}
            className="size-full object-cover"
        />
    );
};

export const Scene = memo(SceneComponent);

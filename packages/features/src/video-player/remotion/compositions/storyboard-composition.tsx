import { VideoComponent } from "../components/video-component";
import type { FC } from "react";
import { Composition, getInputProps } from "remotion";
import { Theme } from "@radix-ui/themes";
import { calculateDuration, FPS } from "../utils";

type Props = {
    scenes: any[];
    width: number;
    height: number;
    fps?: number;
    musicUrl?: string;
};

export const StoryboardComposition: FC = () => {
    const { scenes, musicUrl, fps = FPS, ...props } = getInputProps<Props>();

    const durationInFrames = calculateDuration(scenes);

    return (
        <Composition
            id="Storyboard"
            {...props}
            durationInFrames={durationInFrames}
            fps={fps}
            component={() => (
                <Theme
                    accentColor="lime"
                    grayColor="mauve"
                    panelBackground="solid"
                    radius="large"
                    appearance="dark"
                >
                    <VideoComponent
                        scenes={scenes}
                        musicUrl={musicUrl}
                    />
                </Theme>
            )}
        />
    );
};

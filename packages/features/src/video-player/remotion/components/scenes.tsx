"use client";

import { Fragment, memo, type FC } from "react";
import { AbsoluteFill, useVideoConfig, Easing } from "remotion";
import { Scene } from "./scene";
import { FPS, transitionDuration } from "../utils";
import { FabricCanvas } from "../../../fabric-editor";
import { fade } from "@remotion/transitions/fade";
import { linearTiming, TransitionSeries } from "@remotion/transitions";

type Props = {
  scenes?: any[];
};

const ScenesComponent: FC<Props> = ({ scenes }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Основные сцены */}
      <TransitionSeries>
        {scenes?.map((scene, index) => {
          const durationInFrames = scene.duration * FPS;

          return (
            <Fragment>
              <TransitionSeries.Sequence
                key={index}
                durationInFrames={durationInFrames}
                premountFor={120}
              >
                <Scene
                  type={scene.file?.type ?? "image"}
                  url={scene.file?.url}
                />
              </TransitionSeries.Sequence>
              <TransitionSeries.Transition
                key={index}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: transitionDuration })}
              />
            </Fragment>
          );
        })}
      </TransitionSeries>

      {/* Текст и объекты */}
      <TransitionSeries>
        {scenes?.map((scene, index) => {
          const sceneDurationInFrames = scene.duration * FPS;

          const durationWithTransition =
            sceneDurationInFrames > 30
              ? sceneDurationInFrames - transitionDuration
              : sceneDurationInFrames;

          return (
            <Fragment>
              <TransitionSeries.Sequence
                durationInFrames={durationWithTransition}
              >
                <FabricCanvas
                  key={index}
                  initialObjects={scene.objects}
                  className="absolute left-0 top-0 size-full"
                  width={width}
                  height={height}
                  readonly
                />
              </TransitionSeries.Sequence>
              <TransitionSeries.Sequence durationInFrames={transitionDuration}>
                {/* Чтобы эффект fade не накладывался на предыдущий текст */}
                <></>
              </TransitionSeries.Sequence>
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: transitionDuration,
                  easing: Easing.in(Easing.ease),
                })}
              />
            </Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const Scenes = memo(ScenesComponent);

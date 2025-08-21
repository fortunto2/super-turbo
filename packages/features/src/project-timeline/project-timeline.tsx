"use client";
import {
  type IFileRead,
  TaskTypeEnum,
  IProjectRead,
  useTaskStatus,
} from "@turbo-super/api";

import type { FC } from "react";
import { useEffect, useState, useMemo } from "react";

import "./styles.css";
import { useProjectTimeline2Video } from "./hooks/useProjectTimeline2Video";
import { useGenerateTimeline } from "./hooks/useGenerateTimeline";
import { useDataUpdate } from "./hooks/useDataUpdate";
import {
  eventBus,
  Player,
  SCENE_LOAD,
  useItemsHotkeys,
  useStore,
  useTimelineEvents,
  useTimelineHotkeys,
  StateManager,
  Composition,
  Scene,
  TimelineComponent,
  MenuList,
  MenuItem,
  ControlList,
  ControlItem,
} from "super-timeline";
import { Player as RemotionPlayer } from "@remotion/player";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Создаем компонент композиции для Remotion
const TimelineComposition: React.FC = () => {
  const { width, height } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "red",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div>🎬 Timeline Player</div>
        <div>Frame: {currentFrame}</div>
        <div>
          Size: {width}x{height}
        </div>
        <div style={{ fontSize: "16px", marginTop: "10px" }}>
          Если вы видите этот красный блок, то плеер работает!
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Альтернативная версия без AbsoluteFill для тестирования
const TimelineCompositionAlt: React.FC = () => {
  const { width, height } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "purple",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "24px",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div>🎬 Timeline Player (Alt)</div>
        <div>Frame: {currentFrame}</div>
        <div>
          Size: {width}x{height}
        </div>
        <div style={{ fontSize: "16px", marginTop: "10px" }}>
          Альтернативная версия без AbsoluteFill
        </div>
      </div>
    </div>
  );
};

type Props = {
  projectId: string;
  timeline: any;
  project: IProjectRead;
};

const stateManager = new StateManager();

export const ProjectTimeline: FC<Props> = ({
  projectId,
  timeline,
  project,
}) => {
  const [isComponentsLoaded, setIsComponentsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { mutate: generateTimeline, isLoading: isGenerating } =
    useGenerateTimeline();

  const { mutate: timeline2video, isLoading: isPending } =
    useProjectTimeline2Video();

  const { size, playerRef, duration, fps } = useStore();
  const store = useStore();
  const [data, setData] = useState<any>([]);

  const stableData = useMemo(() => {
    return data;
  }, [data]);

  console.log(store);

  useEffect(() => {
    if (!stableData) return;
    eventBus.dispatch(SCENE_LOAD, {
      payload: stableData,
    });
  }, [stableData]);

  useEffect(() => {
    if (!timeline) return;
    const timer = setTimeout(() => {
      const timelineData = timeline.value;
      setData(timelineData);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [timeline]);

  useTimelineEvents();
  useTimelineHotkeys();
  useItemsHotkeys();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        console.log("⏰ Setting isComponentsLoaded to true");
        setIsComponentsLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isClient]);

  useEffect(() => {
    if (!project || timeline) return;
    handleGenerateTimeline();
  }, [timeline, project]);

  const handleGenerateTimeline = () => {
    generateTimeline({ id: projectId });
  };

  // Показываем загрузку пока компоненты не загружены
  if (!isComponentsLoaded || !isClient) {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            Загрузка timeline компонентов...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full flex-col">
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        /* Стили для Remotion AbsoluteFill */
        .remotion-player-container {
          position: relative;
          overflow: hidden;
        }
        
        .remotion-player-container .remotion-player {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* <MenuList />
        <MenuItem />
        <ControlList />
        <ControlItem /> */}
        {stableData && stableData.id ? (
          <>
            <div className="bg-scene py-3 w-full h-full flex justify-center flex-1">
              <div className="max-w-3xl flex-1  w-full h-full flex relative">
                <RemotionPlayer
                  ref={playerRef as any}
                  component={Composition}
                  durationInFrames={
                    Math.round((duration / 1000) * fps) || 5 * 30
                  }
                  compositionWidth={size.width}
                  compositionHeight={size.height}
                  style={{
                    width: "100%",
                    height: "400px",
                  }}
                  fps={fps}
                  controls
                  loop
                  numberOfSharedAudioTags={10}
                />
              </div>
            </div>
            <div className=" w-full">
              <TimelineComponent stateManager={stateManager} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  {!stableData || !stableData.id
                    ? "Загрузка timeline данных..."
                    : "Инициализация плеера..."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

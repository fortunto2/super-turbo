"use client";
import { IProjectRead } from "@turbo-super/api";

import type { FC } from "react";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@turbo-super/ui";
import { useProjectTimeline2Video } from "./hooks/useProjectTimeline2Video";
import { useGenerateTimeline } from "./hooks/useGenerateTimeline";
import {
  eventBus,
  SCENE_LOAD,
  useItemsHotkeys,
  useStore,
  useTimelineEvents,
  useTimelineHotkeys,
  StateManager,
  TimelineComponent,
  MenuList,
  MenuItem,
  ControlList,
  ControlItem,
  HistoryButtons,
} from "super-timeline";
import "super-timeline/style.css";
import "./styles.css";
import { Scene } from "./components/scene";
import { isEqual } from "lodash";
import { useDataUpdate } from "./hooks";

type Props = {
  projectId: string;
  timeline: any;
  project: IProjectRead;
  onBack: () => void;
};

const stateManager = new StateManager();

export const ProjectTimeline: FC<Props> = ({
  projectId,
  timeline,
  project,
  onBack,
}) => {
  const [isComponentsLoaded, setIsComponentsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { mutate: generateTimeline, isLoading: isGenerating } =
    useGenerateTimeline();

  const { mutate: timeline2video, isLoading: isPending } =
    useProjectTimeline2Video();

  const { mutate: updateTimeline } = useDataUpdate(false);

  const {
    playerRef,
    trackItemDetailsMap,
    tracks,
    trackItemIds,
    trackItemsMap,
  } = useStore();
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

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleUpdateTimeline();
  //   }, 1500);
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [trackItemsMap, trackItemDetailsMap, tracks, trackItemIds]);

  useEffect(() => {
    if (!project || timeline) return;
    handleGenerateTimeline();
  }, [timeline, project]);

  const handleGenerateTimeline = () => {
    generateTimeline({ id: projectId });
  };

  const handleUpdateTimeline = () => {
    if (!timeline || !project) return;

    if (
      !isEqual(timeline.value, {
        ...timeline.value,
        trackItemDetailsMap,
        tracks,
        trackItemIds,
        trackItemsMap,
      })
    ) {
      updateTimeline({
        id: timeline.id,
        value: {
          ...timeline.value,
          trackItemDetailsMap,
          tracks,
          trackItemIds,
          trackItemsMap,
        },
      });
    }
  };

  // Показываем загрузку пока компоненты не загружены
  if (!isComponentsLoaded || !isClient) {
    return (
      <div className="flex min-h-screen size-full items-center justify-center">
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
    <div className="relative flex size-full flex-col min-h-screen">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 320px",
        }}
        className="pointer-events-none absolute inset-x-0 top-0 z-[205] flex h-[72px] items-center px-2"
      >
        <div className="pointer-events-auto flex h-14 items-center gap-2">
          <div className="flex h-12 items-center bg-background px-1.5">
            <Button
              className="flex gap-2 text-muted-foreground"
              variant="ghost"
              onClick={onBack}
            >
              <ArrowLeft /> Back
            </Button>
          </div>

          <HistoryButtons />
        </div>
        <div></div>
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuList />
        <MenuItem />
        <ControlList />
        <ControlItem />
        {stableData && stableData.id ? (
          <Scene />
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

      <div className=" w-full">
        {playerRef && <TimelineComponent stateManager={stateManager} />}
      </div>
    </div>
  );
};

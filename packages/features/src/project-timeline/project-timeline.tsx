"use client";
import { IDataUpdate, IProjectRead } from "@turbo-super/api";

import type { FC } from "react";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@turbo-super/ui";
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
// import "./styles.css";
import { Scene } from "./components/scene";
import { isEqual } from "lodash";
import { TimelineWrapper } from "./timeline-wrapper";

type Props = {
  timeline: any;
  project: IProjectRead;
  onBack: () => void;
  onExport?: () => void;
  onUpdateTimeline?: (payload: IDataUpdate) => void;
  onRegenerateTimeline?: () => void;
};

const stateManager = new StateManager();

export const ProjectTimeline: FC<Props> = ({
  timeline,
  project,
  onBack,
  onExport,
  onUpdateTimeline,
  onRegenerateTimeline,
}) => {
  const [isComponentsLoaded, setIsComponentsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const {
    playerRef,
    trackItemDetailsMap,
    tracks,
    trackItemIds,
    trackItemsMap,
  } = useStore();
  const [data, setData] = useState<any>([]);

  const stableData = useMemo(() => {
    return data;
  }, [data]);

  useEffect(() => {
    if (!stableData) return;
    eventBus.dispatch(SCENE_LOAD, {
      payload: stableData,
    });
  }, [stableData]);

  useEffect(() => {
    if (!project || timeline) return;
    onRegenerateTimeline?.();
  }, [timeline, project]);

  useEffect(() => {
    if (!timeline) return;
    const timer = setTimeout(() => {
      const timelineData = timeline.value;
      console.log(timelineData);
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
    if (!project || !timeline) return;
    const timer = setTimeout(() => {
      handleUpdateTimeline();
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [trackItemsMap, trackItemDetailsMap, tracks, trackItemIds]);

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
      onUpdateTimeline?.({
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
    <TimelineWrapper>
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
        <div className="pointer-events-auto flex h-14 items-center justify-end gap-2">
          <div className="flex h-12 items-center gap-2 rounded-md bg-background px-2.5">
            <Button
              className="flex size-9 gap-1 border border-border"
              size="icon"
              variant="secondary"
              onClick={onExport}
            >
              <Download width={18} />
            </Button>
          </div>
        </div>
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
    </TimelineWrapper>
  );
};

"use client";

import { useProjectVideoRenderStore } from "@/lib/store";
import { EventHandler } from "@/lib/utils/event-source-store-factory";
import { IFileRead, WSMessage, WSMessageTypeEnum } from "@turbo-super/api";

export const useProjectVideoEventHandler = (): EventHandler => {
  const { setState } = useProjectVideoRenderStore();
  return (eventData: WSMessage) => {
    console.log("eventData", eventData);
    if (eventData.type === WSMessageTypeEnum.RENDER_PROGRESS) {
      const { progress } = eventData.object as { progress: number };
      setState({ progress });
    } else if (eventData.type === WSMessageTypeEnum.RENDER_RESULT) {
      const result = eventData.object as IFileRead;
      setState({ result });
    }
  };
};

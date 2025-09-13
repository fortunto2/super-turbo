"use client";

import {
  createEventSourceStore,
  type EventHandler,
} from "@/lib/utils/event-source-store-factory";
import { useEffect } from "react";

type Props = {
  projectId: string;
  eventHandlers: EventHandler[];
};

export const useProjectEventSourceStore = createEventSourceStore("Project");

export const useProjectEvents = ({ projectId, eventHandlers }: Props) => {
  const { initConnection, removeHandlers } = useProjectEventSourceStore();

  useEffect(() => {
    // Используем относительный URL для SSE через Next.js прокси
    const url = `/api/events/project.${projectId}`;
    console.log("🔌 SSE: Connecting to:", url);

    initConnection(url, eventHandlers);

    return () => {
      removeHandlers(eventHandlers);
    };
  }, [projectId]);
};

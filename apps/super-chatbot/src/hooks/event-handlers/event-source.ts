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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const url = `${baseUrl}/api/v1/events/project.${projectId}`;

    initConnection(url, eventHandlers);

    return () => {
      removeHandlers(eventHandlers);
    };
  }, [projectId]);
};

"use client";

import {
  useProjectEventHandler,
  useProjectEvents,
  useFileEventHandler,
  useSceneEventHandler,
} from "@/hooks/event-handlers";
import { useSearchParams } from "next/navigation";

import { ReactNode } from "react";

type Params = {
  projectId: string;
};

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId")!;

  useProjectEvents({
    projectId,
    eventHandlers: [
      useProjectEventHandler(projectId),
      // useEntityEventHandler(projectId),
      useSceneEventHandler(projectId),
      // useProjectVideoEventHandler(),
      useFileEventHandler(),
    ],
  });

  return children;
};

export default Layout;

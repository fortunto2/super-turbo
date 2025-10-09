'use client';

import {
  useProjectEventHandler,
  useProjectEvents,
  useFileEventHandler,
  useSceneEventHandler,
  useProjectVideoEventHandler,
  useEntityEventHandler,
} from '@/hooks/event-handlers';

import type { ReactNode } from 'react';
import { use } from 'react';

type Params = {
  projectId: string;
};

type Props = {
  children: ReactNode;
  params: Promise<Params>;
};

const Layout = ({ children, params }: Props) => {
  const { projectId } = use(params);

  useProjectEvents({
    projectId,
    eventHandlers: [
      useProjectEventHandler(projectId),
      useEntityEventHandler(projectId),
      useSceneEventHandler(projectId),
      useProjectVideoEventHandler(projectId),
      useFileEventHandler(),
    ],
  });

  return children;
};

export default Layout;

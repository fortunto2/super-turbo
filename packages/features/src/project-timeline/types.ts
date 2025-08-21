import type { IDataUpdate, IProjectRead } from "@turbo-super/api";

export interface ProjectTimelineProps {
  projectId: string;
  className?: string;
  onTimelineUpdate?: (timeline: TimelineData) => void;
}

export interface TimelineData {
  id: string;
  project_id: string;
  order: number;
  visual_description?: string;
  action_description?: string;
  dialogue?: Record<string, any>;
  duration?: number;
  file?: {
    id: string;
    url: string;
    type: string;
  };
}

export interface ProjectTimelineMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  mutationKey?: string[];
}

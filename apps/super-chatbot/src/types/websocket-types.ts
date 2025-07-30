export interface ImageWSMessage {
  type: string;
  object?: any;
  data?: any;
  error?: string;
  progress?: number;
  status?: string;
  imageUrl?: string;
  projectId?: string;
  // Additional fields for file objects
  url?: string;
  id?: string;
  // Add request tracking
  requestId?: string;
}

export interface VideoWSMessage {
  type: string;
  object?: any;
  data?: any;
  error?: string;
  progress?: number;
  status?: string;
  videoUrl?: string;
  projectId?: string;
  url?: string;
  id?: string;
  requestId?: string;
}

export type ImageEventHandler = (eventData: ImageWSMessage) => void;
export type VideoEventHandler = (eventData: VideoWSMessage) => void;
export type ConnectionStateHandler = (isConnected: boolean) => void;

// Interface for project-specific handler registration
export interface ProjectHandler<T = ImageEventHandler> {
  projectId: string;
  handler: T;
  requestId?: string;
  timestamp: number;
}

export interface ImageProjectHandler
  extends ProjectHandler<ImageEventHandler> {}
export interface VideoProjectHandler
  extends ProjectHandler<VideoEventHandler> {}

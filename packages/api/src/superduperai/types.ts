// SuperDuperAI API types

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthCredentials {
  token: string;
  userId?: string;
}

export interface GenerationRequest {
  prompt: string;
  model: string;
  parameters?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface GenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress?: number;
}

export interface ModelConfig {
  name: string;
  type: string;
  source: string;
  params?: {
    workflow_path?: string;
    price?: number;
    max_duration?: number;
    max_resolution?: { width: number; height: number };
    supported_frame_rates?: number[];
    supported_aspect_ratios?: string[];
    supported_qualities?: string[];
  };
}

export interface GenerationConfig {
  id: string;
  name: string;
  type: string;
  source: string;
  params?: Record<string, any>;
}

export interface VideoModel extends ModelConfig {}
export interface ImageModel extends ModelConfig {}

export enum GenerationType {
  TEXT_TO_IMAGE = "text_to_image",
  IMAGE_TO_IMAGE = "image_to_image",
  TEXT_TO_VIDEO = "text_to_video",
  IMAGE_TO_VIDEO = "image_to_video",
  VIDEO_TO_VIDEO = "video_to_video"
}

export enum ListOrder {
  ASC = "asc",
  DESC = "desc"
}

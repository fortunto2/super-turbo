/**
 * Типы для хука генерации видео
 * Вынесены в отдельный файл для лучшей организации кода
 */

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  projectId?: string;
  requestId?: string;
  settings: {
    model: string;
    style: string;
    resolution: string;
    shotSize: string;
    duration: number;
    frameRate: number;
    negativePrompt?: string;
  };
}

export interface UseVideoGeneratorReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: GeneratedVideo | null;
  generatedVideos: GeneratedVideo[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  generateVideo: (formData: VideoGenerationFormData) => Promise<void>;
  retryGeneration: () => Promise<void>;
  clearGeneration: () => void;
  clearAllVideos: () => void;
  deleteVideo: (videoId: string) => void;
  saveVideo: (video: GeneratedVideo) => void;

  // Settings
  updateSettings: (settings: Partial<VideoGenerationFormData>) => void;
  getLastGenerationParams: () => VideoGenerationFormData | null;

  // Persistence
  loadStoredVideos: () => void;
  clearStoredVideos: () => void;
}

export interface VideoGenerationFormData {
  prompt: string;
  model: string;
  style: string;
  resolution: string;
  shotSize: string;
  duration: number;
  frameRate: number;
  negativePrompt?: string;
  projectId?: string;
}

export type GenerationStatus =
  | 'idle'
  | 'preparing'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'error';

export interface VideoGenerationState {
  status: GenerationStatus;
  progress: number;
  message?: string;
  error?: string;
  requestId?: string;
  videoUrl?: string;
  projectId?: string;
}

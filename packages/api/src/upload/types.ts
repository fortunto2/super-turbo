// File upload types
export interface UploadRequest {
  file: File;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

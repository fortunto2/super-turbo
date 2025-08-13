// File related types

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}



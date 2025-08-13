// Common types used across both projects

export type Environment = 'development' | 'production' | 'test';

export type Status = 'success' | 'error' | 'pending' | 'failed';

export type FileType = 'image' | 'video' | 'audio' | 'document';

export type ContentType = 
  | 'image/png'
  | 'image/jpeg' 
  | 'image/webp'
  | 'video/mp4'
  | 'video/mov'
  | 'video/avi';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}



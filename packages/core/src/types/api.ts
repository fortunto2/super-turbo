// API related types

export interface ApiConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ApiHeaders {
  'Content-Type'?: string;
  'Authorization'?: string;
  'User-Agent'?: string;
  [key: string]: string | undefined;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: ApiHeaders;
  body?: any;
  timeout?: number;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}



// Общие типы для артефактов
export interface BaseArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: ArtifactStatus;
  metadata?: Record<string, any>;
}

export type ArtifactType = "image" | "video" | "text" | "sheet" | "script";

export type ArtifactStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

// Типы для изображений
export interface ImageArtifact extends BaseArtifact {
  type: "image";
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  parameters?: ImageParameters;
}

export interface ImageParameters {
  width: number;
  height: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  model?: string;
  scheduler?: string;
}

// Типы для видео
export interface VideoArtifact extends BaseArtifact {
  type: "video";
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  parameters?: VideoParameters;
}

export interface VideoParameters {
  width: number;
  height: number;
  duration: number;
  fps?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  model?: string;
  scheduler?: string;
}

// Типы для текста
export interface TextArtifact extends BaseArtifact {
  type: "text";
  content: string;
  wordCount?: number;
  language?: string;
  model?: string;
  parameters?: TextParameters;
}

export interface TextParameters {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model?: string;
  systemPrompt?: string;
}

// Типы для таблиц
export interface SheetArtifact extends BaseArtifact {
  type: "sheet";
  content: string;
  rows?: number;
  columns?: number;
  format?: "csv" | "xlsx" | "json";
  model?: string;
  parameters?: SheetParameters;
}

export interface SheetParameters {
  rows: number;
  columns: number;
  headers?: string[];
  dataTypes?: string[];
  model?: string;
}

// Типы для скриптов
export interface ScriptArtifact extends BaseArtifact {
  type: "script";
  content: string;
  language?: string;
  model?: string;
  parameters?: ScriptParameters;
}

export interface ScriptParameters {
  language: string;
  framework?: string;
  dependencies?: string[];
  model?: string;
}

// Объединенный тип для всех артефактов
export type Artifact =
  | ImageArtifact
  | VideoArtifact
  | TextArtifact
  | SheetArtifact
  | ScriptArtifact;

// Типы для API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Типы для конфигураций
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: "text" | "image" | "video" | "multimodal";
  capabilities: string[];
  parameters: Record<string, any>;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

// Типы для пользователей и сессий
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// Типы для чата
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  artifacts?: Artifact[];
  metadata?: Record<string, any>;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
}

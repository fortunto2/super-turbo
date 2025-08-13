import { z } from 'zod';

declare const APP_CONFIG: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_IMAGE_SIZE: number;
    readonly MAX_VIDEO_SIZE: number;
    readonly SUPPORTED_IMAGE_FORMATS: readonly ["png", "jpg", "jpeg", "webp"];
    readonly SUPPORTED_VIDEO_FORMATS: readonly ["mp4", "mov", "avi"];
};
declare const UI_CONFIG: {
    readonly ANIMATION_DURATION: 300;
    readonly DEBOUNCE_DELAY: 300;
    readonly TOAST_DURATION: 5000;
    readonly PAGINATION_DEFAULT_SIZE: 20;
};
declare const FEATURE_FLAGS: {
    readonly ENABLE_VIDEO_GENERATION: true;
    readonly ENABLE_IMAGE_EDITING: true;
    readonly ENABLE_AI_CHAT: true;
    readonly ENABLE_PAYMENTS: true;
};

declare const API_CONFIG: {
    readonly TIMEOUT: 30000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
};
declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly GATEWAY_TIMEOUT: 504;
};
declare const API_HEADERS: {
    readonly CONTENT_TYPE: "Content-Type";
    readonly AUTHORIZATION: "Authorization";
    readonly USER_AGENT: "User-Agent";
};
declare const API_METHODS: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly DELETE: "DELETE";
    readonly PATCH: "PATCH";
};

declare const APP_NAME = "SuperDuperAI";
declare const APP_VERSION = "3.0.0";
declare const ENV: {
    readonly DEVELOPMENT: "development";
    readonly PRODUCTION: "production";
    readonly TEST: "test";
};
declare const API_ENDPOINTS: {
    readonly AUTH: "/api/auth";
    readonly UPLOAD: "/api/files/upload";
    readonly GENERATE: "/api/generate";
    readonly BALANCE: "/api/user/balance";
    readonly SUPERDUPERAI_BASE_URL: string;
    readonly STRIPE_BASE_URL: string;
    readonly UPLOAD_BASE_URL: string;
    readonly WEBSOCKET_BASE_URL: string;
};
declare const FILE_TYPES: {
    readonly IMAGE: "image";
    readonly VIDEO: "video";
    readonly AUDIO: "audio";
    readonly DOCUMENT: "document";
};
declare const CONTENT_TYPES: {
    readonly IMAGE_PNG: "image/png";
    readonly IMAGE_JPEG: "image/jpeg";
    readonly IMAGE_WEBP: "image/webp";
    readonly VIDEO_MP4: "video/mp4";
};
declare const STATUS: {
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly PENDING: "pending";
    readonly FAILED: "failed";
};

declare const API_NEXT_ROUTES: {
    readonly GENERATE_IMAGE: "/api/generate/image";
    readonly GENERATE_VIDEO: "/api/generate/video";
    readonly FILE: (id: string) => string;
    readonly FILE_UPLOAD: "/api/file/upload";
    readonly PROJECT: (id: string) => string;
    readonly PROJECT_VIDEO: "/api/project/video";
    readonly ENHANCE_PROMPT: "/api/enhance-prompt";
    readonly MODELS: "/api/config/models";
    readonly SUPERDUPERAI: "/api/config/superduperai";
    readonly EVENTS_FILE: (fileId: string) => string;
    readonly GENERATE_SCRIPT: "/api/generate/script";
};
interface ToolConfig {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    iconName: 'image' | 'video' | 'wand' | 'sparkles' | 'zap' | 'play' | 'languages' | 'gallery';
    href: string;
    category: 'generation' | 'enhancement' | 'utility' | 'gallery';
    features: {
        iconName: 'sparkles' | 'zap' | 'play' | 'languages';
        label: string;
    }[];
    primaryColor: string;
    hoverColor: string;
    bgColor: string;
    hoverBgColor: string;
}
declare const TOOLS_CONFIG: ToolConfig[];
declare const TOOL_CATEGORIES: {
    readonly GENERATION: "generation";
    readonly ENHANCEMENT: "enhancement";
    readonly UTILITY: "utility";
    readonly GALLERY: "gallery";
};
declare const TOOL_ICONS: {
    readonly IMAGE: "image";
    readonly VIDEO: "video";
    readonly WAND: "wand";
    readonly SPARKLES: "sparkles";
    readonly ZAP: "zap";
    readonly PLAY: "play";
    readonly LANGUAGES: "languages";
    readonly GALLERY: "gallery";
};

interface MediaResolution {
    width: number;
    height: number;
    label: string;
    aspectRatio: string;
    qualityType: string;
}
interface MediaOption {
    id: string;
    label: string;
    description: string;
}
/**
 * Shared video generation constants
 * Centralized constants to eliminate duplication across video components
 */
declare const VIDEO_RESOLUTIONS: MediaResolution[];
declare const SHOT_SIZES: MediaOption[];
declare const VIDEO_STYLES: MediaOption[];
declare const VIDEO_DURATIONS: readonly [5, 10, 15, 20, 30, 45, 60];
declare const VIDEO_FPS: readonly [24, 30, 60];
declare const DEFAULT_VIDEO_CONFIG: {
    readonly resolution: MediaResolution;
    readonly shotSize: MediaOption;
    readonly style: MediaOption;
    readonly duration: 5;
    readonly fps: 24;
};

interface VideoModel {
    name: string;
    label: string;
    type: string;
    source: string;
    params?: {
        price_per_second?: number;
        max_duration?: number;
        max_resolution?: {
            width: number;
            height: number;
        };
        supported_frame_rates?: number[];
        workflow_path?: string;
        supported_aspect_ratios?: string[];
        supported_qualities?: string[];
    };
}
interface EnhancedVideoModel extends VideoModel {
    id?: string;
    description?: string;
    maxDuration?: number;
    maxResolution?: {
        width: number;
        height: number;
    };
    supportedFrameRates?: number[];
    pricePerSecond?: number;
    workflowPath?: string;
    supportedAspectRatios?: string[];
    supportedQualities?: string[];
    category: "text_to_video" | "image_to_video" | "video_to_video";
    uiLabel: string;
    uiDescription: string;
    recommendedSettings: any;
    bestFor: string[];
    priceTier: "budget" | "standard" | "premium" | "luxury";
    requiresSourceImage: boolean;
    requiresSourceVideo: boolean;
}
interface VideoModelMetadata {
    category: "text_to_video" | "image_to_video" | "video_to_video";
    ui_label: string;
    ui_description: string;
    recommended_settings: any;
    best_for: string[];
}
interface VideoModelsConfig {
    model_metadata: Record<string, VideoModelMetadata>;
}
declare const DEFAULT_VIDEO_MODELS: VideoModel[];
declare const PRICE_TIER_THRESHOLDS: {
    readonly BUDGET: 0.5;
    readonly STANDARD: 1.5;
    readonly PREMIUM: 2.5;
    readonly LUXURY: number;
};
declare const VIDEO_MODEL_CATEGORIES: {
    readonly TEXT_TO_VIDEO: "text_to_video";
    readonly IMAGE_TO_VIDEO: "image_to_video";
    readonly VIDEO_TO_VIDEO: "video_to_video";
};
declare const PRICE_TIERS: {
    readonly BUDGET: "budget";
    readonly STANDARD: "standard";
    readonly PREMIUM: "premium";
    readonly LUXURY: "luxury";
};
/**
 * Determine price tier based on price per second
 */
declare function getPriceTier(pricePerSecond: number): keyof typeof PRICE_TIERS;
/**
 * Determine category from model name
 */
declare function getModelCategory(modelName: string): keyof typeof VIDEO_MODEL_CATEGORIES;
/**
 * Get default video model by category
 */
declare function getDefaultVideoModelByCategory(category: keyof typeof VIDEO_MODEL_CATEGORIES): VideoModel | undefined;
/**
 * Get video models by price tier
 */
declare function getVideoModelsByPriceTier(models: VideoModel[], tier: keyof typeof PRICE_TIERS): VideoModel[];
/**
 * Get video models by category
 */
declare function getVideoModelsByCategory(models: VideoModel[], category: keyof typeof VIDEO_MODEL_CATEGORIES): VideoModel[];

interface MediaSettingsOption {
    id: string;
    label: string;
    description: string;
    value: string;
    category?: string;
    tags?: string[];
}
interface ImageGenerationConfig {
    availableModels: MediaSettingsOption[];
    availableResolutions: MediaSettingsOption[];
    availableStyles: MediaSettingsOption[];
    availableShotSizes: MediaSettingsOption[];
    supportedFormats: string[];
    maxBatchSize: number;
    qualityOptions: MediaSettingsOption[];
    defaultSettings: {
        model: string;
        resolution: string;
        style: string;
        shotSize: string;
    };
}
interface VideoGenerationConfig {
    availableModels: MediaSettingsOption[];
    availableResolutions: MediaSettingsOption[];
    availableStyles: MediaSettingsOption[];
    availableShotSizes: MediaSettingsOption[];
    supportedDurations: number[];
    supportedFps: number[];
    maxDuration: number;
    qualityPresets: MediaSettingsOption[];
    defaultSettings: {
        model: string;
        resolution: string;
        style: string;
        shotSize: string;
        duration: number;
        fps: number;
    };
}
interface IGenerationConfigRead {
    name: string;
    type: string;
    source: string;
    params?: {
        workflow_path?: string;
        price?: number;
        max_duration?: number;
        max_resolution?: {
            width: number;
            height: number;
        };
        supported_frame_rates?: number[];
        supported_aspect_ratios?: string[];
        supported_qualities?: string[];
    };
}
declare enum ShotSizeEnum {
    EXTREME_LONG_SHOT = "extreme_long_shot",
    LONG_SHOT = "long_shot",
    MEDIUM_SHOT = "medium_shot",
    CLOSE_UP = "close_up",
    EXTREME_CLOSE_UP = "extreme_close_up",
    TWO_SHOT = "two_shot",
    OVER_THE_SHOULDER = "over_the_shoulder",
    POINT_OF_VIEW = "point_of_view"
}
declare const DEFAULT_IMAGE_CONFIG: ImageGenerationConfig;
declare const DEFAULT_VIDEO_GENERATION_CONFIG: VideoGenerationConfig;
declare const CACHE_CONFIG: {
    readonly DURATION: number;
    readonly IMAGE_CONFIG_KEY: "image_config_cache";
    readonly VIDEO_CONFIG_KEY: "video_config_cache";
};
declare const PRIORITY_MODELS: {
    readonly IMAGE: readonly ["comfyui/flux", "comfyui/sdxl", "flux-dev", "sdxl"];
    readonly VIDEO: readonly ["comfyui/ltx", "comfyui/veo3", "comfyui/kling"];
};
/**
 * Adapter function to convert OpenAPI model to MediaSettings format
 */
declare function adaptModelForMediaSettings(model: IGenerationConfigRead): IGenerationConfigRead & {
    id: string;
    label: string;
    description: string;
    value: string;
    workflowPath: string;
    price: number;
};
/**
 * Get default model by priority
 */
declare function getDefaultModelByPriority(models: IGenerationConfigRead[], priorityList: string[]): IGenerationConfigRead | undefined;
/**
 * Validate media settings configuration
 */
declare function validateMediaSettingsConfig(config: ImageGenerationConfig | VideoGenerationConfig): boolean;

type Environment = 'development' | 'production' | 'test';
type Status = 'success' | 'error' | 'pending' | 'failed';
type FileType = 'image' | 'video' | 'audio' | 'document';
type ContentType = 'image/png' | 'image/jpeg' | 'image/webp' | 'video/mp4' | 'video/mov' | 'video/avi';
interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

interface ApiConfig {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}
interface ApiHeaders {
    'Content-Type'?: string;
    'Authorization'?: string;
    'User-Agent'?: string;
    [key: string]: string | undefined;
}
interface ApiRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: ApiHeaders;
    body?: any;
    timeout?: number;
}
interface ApiError {
    status: number;
    message: string;
    code?: string;
    details?: any;
}

interface FileInfo {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
}
interface FileUploadResponse {
    success: boolean;
    fileId?: string;
    fileUrl?: string;
    error?: string;
}
interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface UserSession {
    user: User;
    expires: Date;
    token: string;
}
interface UserBalance {
    userId: string;
    credits: number;
    lastUpdated: Date;
}

declare const emailSchema: z.ZodString;
declare const urlSchema: z.ZodString;
declare function isValidEmail(email: string): boolean;
declare function isValidUrl(url: string): boolean;
declare function validateFileSize(size: number, maxSize: number): boolean;
declare function validateFileType(type: string, allowedTypes: string[]): boolean;

declare function formatFileSize(bytes: number): string;
declare function formatDate(date: Date): string;
declare function formatDateTime(date: Date): string;

declare function getFileExtension(filename: string): string;
declare function getFileNameWithoutExtension(filename: string): string;
declare function isImageFile(filename: string): boolean;
declare function isVideoFile(filename: string): boolean;

export { API_CONFIG, API_ENDPOINTS, API_HEADERS, API_METHODS, API_NEXT_ROUTES, APP_CONFIG, APP_NAME, APP_VERSION, type ApiConfig, type ApiError, type ApiHeaders, type ApiRequestOptions, type ApiResponse, type BaseEntity, CACHE_CONFIG, CONTENT_TYPES, type ContentType, DEFAULT_IMAGE_CONFIG, DEFAULT_VIDEO_CONFIG, DEFAULT_VIDEO_GENERATION_CONFIG, DEFAULT_VIDEO_MODELS, ENV, type EnhancedVideoModel, type Environment, FEATURE_FLAGS, FILE_TYPES, type FileInfo, type FileType, type FileUploadResponse, type FileValidationResult, HTTP_STATUS, type IGenerationConfigRead, type ImageGenerationConfig, type MediaOption, type MediaResolution, type MediaSettingsOption, PRICE_TIERS, PRICE_TIER_THRESHOLDS, PRIORITY_MODELS, type PaginatedResponse, type PaginationParams, SHOT_SIZES, STATUS, ShotSizeEnum, type Status, TOOLS_CONFIG, TOOL_CATEGORIES, TOOL_ICONS, type ToolConfig, UI_CONFIG, type User, type UserBalance, type UserSession, VIDEO_DURATIONS, VIDEO_FPS, VIDEO_MODEL_CATEGORIES, VIDEO_RESOLUTIONS, VIDEO_STYLES, type VideoGenerationConfig, type VideoModel, type VideoModelMetadata, type VideoModelsConfig, adaptModelForMediaSettings, emailSchema, formatDate, formatDateTime, formatFileSize, getDefaultModelByPriority, getDefaultVideoModelByCategory, getFileExtension, getFileNameWithoutExtension, getModelCategory, getPriceTier, getVideoModelsByCategory, getVideoModelsByPriceTier, isImageFile, isValidEmail, isValidUrl, isVideoFile, urlSchema, validateFileSize, validateFileType, validateMediaSettingsConfig };

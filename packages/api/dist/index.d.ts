import { AxiosRequestConfig, AxiosInstance } from 'axios';

declare class SuperDuperAIClient {
    private client;
    constructor(config?: AxiosRequestConfig);
    request<T>(config: AxiosRequestConfig): Promise<T>;
    getAxiosInstance(): AxiosInstance;
}
declare const superDuperAIClient: SuperDuperAIClient;

interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
interface AuthCredentials {
    token: string;
    userId?: string;
}
interface GenerationRequest {
    prompt: string;
    model: string;
    parameters?: Record<string, any>;
    userId?: string;
    sessionId?: string;
}
interface GenerationResponse {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    progress?: number;
}
interface ModelConfig {
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
interface GenerationConfig {
    id: string;
    name: string;
    type: string;
    source: string;
    params?: Record<string, any>;
}
interface VideoModel extends ModelConfig {
}
interface ImageModel extends ModelConfig {
}
declare enum GenerationType {
    TEXT_TO_IMAGE = "text_to_image",
    IMAGE_TO_IMAGE = "image_to_image",
    TEXT_TO_VIDEO = "text_to_video",
    IMAGE_TO_VIDEO = "image_to_video",
    VIDEO_TO_VIDEO = "video_to_video"
}
declare enum ListOrder {
    ASC = "asc",
    DESC = "desc"
}

declare const ENDPOINTS: {
    readonly BASE: "/api";
    readonly GENERATE_IMAGE: "/api/generate/image";
    readonly GENERATE_VIDEO: "/api/generate/video";
    readonly GENERATE_SCRIPT: "/api/generate/script";
    readonly CONFIG_MODELS: "/api/config/models";
    readonly CONFIG_SUPERDUPERAI: "/api/config/superduperai";
    readonly CONFIG_GENERATION: "/api/config/generation";
    readonly FILE_UPLOAD: "/api/files/upload";
    readonly FILE_DOWNLOAD: "/api/file";
    readonly PROJECT_CREATE: "/api/project";
    readonly PROJECT_VIDEO: "/api/project/video";
    readonly USER_BALANCE: "/api/user/balance";
    readonly USER_HISTORY: "/api/history";
    readonly ENHANCE_PROMPT: "/api/enhance-prompt";
    readonly EVENTS_FILE: "/api/events/file";
    readonly WEBSOCKET_BASE: "wss://ws.superduperai.co";
    readonly WEBSOCKET_CHAT: "wss://ws.superduperai.co/chat";
    readonly WEBSOCKET_GENERATION: "wss://ws.superduperai.co/generation";
};
declare const API_ROUTES: {
    readonly NEXT: {
        readonly GENERATE_IMAGE: "/api/generate/image";
        readonly GENERATE_VIDEO: "/api/generate/video";
        readonly GENERATE_SCRIPT: "/api/generate/script";
        readonly FILE: (id: string) => string;
        readonly FILE_UPLOAD: "/api/file/upload";
        readonly PROJECT: (id: string) => string;
        readonly PROJECT_VIDEO: "/api/project/video";
        readonly ENHANCE_PROMPT: "/api/enhance-prompt";
        readonly MODELS: "/api/config/models";
        readonly SUPERDUPERAI: "/api/config/superduperai";
        readonly EVENTS_FILE: (fileId: string) => string;
    };
};

interface SuperduperAIConfig {
    url: string;
    token: string;
    wsURL: string;
}
/**
 * Validate Bearer token format
 * Ensures token is properly formatted for API authentication
 */
declare function validateBearerToken(token: string): boolean;
/**
 * Get SuperDuperAI configuration
 */
declare function getSuperduperAIConfig(): SuperduperAIConfig;
/**
 * Client-side function to get config from API
 */
declare function getClientSuperduperAIConfig(): Promise<SuperduperAIConfig>;
/**
 * Get cached models or fetch from API
 */
declare function getCachedModels<T>(cacheKey: string, fetchFunction: () => Promise<T[]>): Promise<T[]>;
/**
 * Clear model cache
 */
declare function clearModelCache(): void;
/**
 * Get cache statistics
 */
declare function getCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    totalSize: number;
};

declare class StripeClient {
    private client;
    constructor(config?: AxiosRequestConfig);
    request<T>(config: AxiosRequestConfig): Promise<T>;
    getAxiosInstance(): AxiosInstance;
}
declare const stripeClient: StripeClient;

interface StripeCustomer {
    id: string;
    email: string;
    name?: string;
    created: number;
}
interface StripeSubscription {
    id: string;
    customerId: string;
    status: string;
    currentPeriodEnd: number;
    items: StripeSubscriptionItem[];
}
interface StripeSubscriptionItem {
    id: string;
    priceId: string;
    quantity: number;
}
interface StripePrice {
    id: string;
    productId: string;
    active: boolean;
    currency: string;
    unitAmount: number;
    recurring?: {
        interval: "day" | "week" | "month" | "year";
        intervalCount: number;
    };
}

declare const STRIPE_ENDPOINTS: {
    readonly CUSTOMERS: {
        readonly CREATE: "/customers";
        readonly GET: "/customers/:id";
        readonly UPDATE: "/customers/:id";
        readonly DELETE: "/customers/:id";
    };
    readonly SUBSCRIPTIONS: {
        readonly CREATE: "/subscriptions";
        readonly GET: "/subscriptions/:id";
        readonly UPDATE: "/subscriptions/:id";
        readonly CANCEL: "/subscriptions/:id/cancel";
    };
    readonly PRICES: {
        readonly LIST: "/prices";
        readonly GET: "/prices/:id";
    };
    readonly CHECKOUT: {
        readonly SESSIONS: "/checkout/sessions";
        readonly SESSION: "/checkout/sessions/:id";
    };
};

declare class UploadClient {
    private client;
    constructor(config?: AxiosRequestConfig);
    request<T>(config: AxiosRequestConfig): Promise<T>;
    getAxiosInstance(): AxiosInstance;
}
declare const uploadClient: UploadClient;

interface UploadRequest {
    file: File;
    metadata?: Record<string, any>;
    onProgress?: (progress: number) => void;
}
interface UploadResponse {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
}
interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

declare class WebSocketClient {
    private url;
    private options;
    private socket;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor(url?: string, options?: {
        onMessage?: (data: any) => void;
        onOpen?: () => void;
        onClose?: () => void;
        onError?: (error: Event) => void;
    });
    connect(): Promise<void>;
    private attemptReconnect;
    send(data: any): void;
    disconnect(): void;
    isConnected(): boolean;
}
declare const webSocketClient: WebSocketClient;

interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
    id?: string;
}
interface WebSocketEvent {
    type: "open" | "message" | "close" | "error";
    data?: any;
    error?: Event;
}
interface WebSocketConfig {
    url: string;
    protocols?: string | string[];
    reconnectAttempts?: number;
    reconnectDelay?: number;
}

export { type APIResponse, API_ROUTES, type AuthCredentials, ENDPOINTS, type GenerationConfig, type GenerationRequest, type GenerationResponse, GenerationType, type ImageModel, ListOrder, type ModelConfig, STRIPE_ENDPOINTS, StripeClient, type StripeCustomer, type StripePrice, type StripeSubscription, type StripeSubscriptionItem, SuperDuperAIClient, type SuperduperAIConfig, UploadClient, type UploadProgress, type UploadRequest, type UploadResponse, type VideoModel, WebSocketClient, type WebSocketConfig, type WebSocketEvent, type WebSocketMessage, clearModelCache, getCacheStats, getCachedModels, getClientSuperduperAIConfig, getSuperduperAIConfig, stripeClient, superDuperAIClient, uploadClient, validateBearerToken, webSocketClient };

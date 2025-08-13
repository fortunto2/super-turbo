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

interface ImageGenerationParams {
    prompt: string;
    model: any;
    style: any;
    resolution: any;
    shotSize: any;
    negativePrompt?: string;
    seed?: number;
    batchSize?: number;
}
interface ImageToImageParams extends ImageGenerationParams {
    file: File;
    sourceImageId?: string;
    sourceImageUrl?: string;
}
interface ImageGenerationResult {
    success: boolean;
    projectId?: string;
    requestId?: string;
    fileId?: string;
    message?: string;
    error?: string;
    files?: any[];
    url?: string;
    method?: "sse" | "polling";
    tasks?: any[];
}
interface ImageGenerationStrategy {
    readonly type: string;
    readonly requiresSourceImage: boolean;
    readonly requiresPrompt: boolean;
    generatePayload(params: ImageGenerationParams | ImageToImageParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
    validate(params: ImageGenerationParams | ImageToImageParams): {
        valid: boolean;
        error?: string;
    };
}

declare function generateImageWithStrategy(generationType: string, params: ImageGenerationParams | ImageToImageParams, config: {
    url: string;
    token: string;
}): Promise<ImageGenerationResult>;

declare class ImageGenerationStrategyFactory {
    private strategies;
    constructor();
    registerStrategy(strategy: ImageGenerationStrategy): void;
    getStrategy(type: string): ImageGenerationStrategy | null;
    getAllStrategies(): ImageGenerationStrategy[];
    getSupportedTypes(): string[];
}

declare class TextToImageStrategy implements ImageGenerationStrategy {
    readonly type = "text-to-image";
    readonly requiresSourceImage = false;
    readonly requiresPrompt = true;
    validate(params: ImageGenerationParams): {
        valid: boolean;
        error?: string;
    };
    generatePayload(params: ImageGenerationParams): Promise<any>;
}

declare class ImageToImageStrategy implements ImageGenerationStrategy {
    readonly type = "image-to-image";
    readonly requiresSourceImage = true;
    readonly requiresPrompt = true;
    validate(params: ImageToImageParams): {
        valid: boolean;
        error?: string;
    };
    handleImageUpload(params: ImageToImageParams, config: {
        url: string;
        token: string;
    }): Promise<{
        imageId?: string;
        imageUrl?: string;
        method: "upload";
        error?: string;
    }>;
    generatePayload(params: ImageToImageParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
}

interface VideoGenerationParams {
    prompt: string;
    model: any;
    style: any;
    resolution: any;
    shotSize: any;
    duration: number;
    frameRate: number;
    negativePrompt?: string;
    seed?: number;
    generationType?: string;
}
interface ImageToVideoParams extends VideoGenerationParams {
    file: File;
}
interface VideoGenerationResult {
    success: boolean;
    projectId?: string;
    requestId?: string;
    fileId?: string;
    message?: string;
    error?: string;
    files?: any[];
    url?: string;
    method?: "sse" | "polling";
}
interface VideoGenerationStrategy {
    readonly type: string;
    readonly requiresSourceImage: boolean;
    readonly requiresPrompt: boolean;
    generatePayload(params: VideoGenerationParams | ImageToVideoParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
    validate(params: VideoGenerationParams | ImageToVideoParams): {
        valid: boolean;
        error?: string;
    };
}

declare function generateVideoWithStrategy(generationType: string, params: VideoGenerationParams | ImageToVideoParams, config: {
    url: string;
    token: string;
}): Promise<VideoGenerationResult>;

declare class VideoGenerationStrategyFactory {
    private strategies;
    constructor();
    registerStrategy(strategy: VideoGenerationStrategy): void;
    getStrategy(type: string): VideoGenerationStrategy | null;
    getAllStrategies(): VideoGenerationStrategy[];
    getSupportedTypes(): string[];
}

declare class TextToVideoStrategy implements VideoGenerationStrategy {
    readonly type = "text-to-video";
    readonly requiresSourceImage = false;
    readonly requiresPrompt = true;
    validate(params: VideoGenerationParams): {
        valid: boolean;
        error?: string;
    };
    generatePayload(params: VideoGenerationParams, config?: {
        url: string;
        token: string;
    }): any;
}

declare class ImageToVideoStrategy implements VideoGenerationStrategy {
    readonly type = "image-to-video";
    readonly requiresSourceImage = true;
    readonly requiresPrompt = false;
    validate(params: ImageToVideoParams): {
        valid: boolean;
        error?: string;
    };
    /**
     * Handle image upload to SuperDuperAI
     */
    handleImageUpload(params: ImageToVideoParams, config: {
        url: string;
        token: string;
    }): Promise<{
        imageId?: string;
        imageUrl?: string;
        method: "upload";
        error?: string;
    }>;
    generatePayload(params: ImageToVideoParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
}

/**
 * Tool operation types and their costs
 */
interface ToolOperation {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costMultipliers?: {
        [key: string]: number;
    };
}
/**
 * Pricing configuration for different tools
 */
declare const TOOLS_PRICING: {
    readonly "image-generation": {
        readonly "text-to-image": {
            readonly id: "text-to-image";
            readonly name: "Text to Image";
            readonly description: "Generate image from text prompt";
            readonly baseCost: 5;
            readonly costMultipliers: {
                readonly "standard-quality": 1;
                readonly "high-quality": 1.5;
                readonly "ultra-quality": 2;
            };
        };
        readonly "image-to-image": {
            readonly id: "image-to-image";
            readonly name: "Image to Image";
            readonly description: "Transform existing image";
            readonly baseCost: 7;
            readonly costMultipliers: {
                readonly "standard-quality": 1;
                readonly "high-quality": 1.5;
                readonly "ultra-quality": 2;
            };
        };
    };
    readonly "video-generation": {
        readonly "text-to-video": {
            readonly id: "text-to-video";
            readonly name: "Text to Video";
            readonly description: "Generate video from text prompt";
            readonly baseCost: 7.5;
            readonly costMultipliers: {
                readonly "duration-5s": 1;
                readonly "duration-10s": 2;
                readonly "duration-15s": 3;
                readonly "duration-30s": 6;
                readonly "hd-quality": 1;
                readonly "4k-quality": 2;
            };
        };
        readonly "image-to-video": {
            readonly id: "image-to-video";
            readonly name: "Image to Video";
            readonly description: "Convert image to video";
            readonly baseCost: 11.25;
            readonly costMultipliers: {
                readonly "duration-5s": 1;
                readonly "duration-10s": 2;
                readonly "duration-15s": 3;
                readonly "duration-30s": 6;
                readonly "hd-quality": 1;
                readonly "4k-quality": 2;
            };
        };
    };
    readonly "script-generation": {
        readonly "basic-script": {
            readonly id: "basic-script";
            readonly name: "Script Generation";
            readonly description: "Generate script or text content";
            readonly baseCost: 1;
            readonly costMultipliers: {
                readonly "long-form": 2;
            };
        };
    };
    readonly "prompt-enhancement": {
        readonly "basic-enhancement": {
            readonly id: "basic-enhancement";
            readonly name: "Prompt Enhancement";
            readonly description: "Enhance and improve prompts";
            readonly baseCost: 1;
        };
        readonly "veo3-enhancement": {
            readonly id: "veo3-enhancement";
            readonly name: "VEO3 Prompt Enhancement";
            readonly description: "Advanced prompt enhancement for VEO3";
            readonly baseCost: 2;
        };
    };
};
/**
 * Free balance allocations for different user types
 */
declare const FREE_BALANCE_BY_USER_TYPE: {
    readonly guest: 50;
    readonly regular: 100;
    readonly demo: 100;
};
type UserType = keyof typeof FREE_BALANCE_BY_USER_TYPE;
/**
 * Calculate cost for a specific operation
 */
declare function calculateOperationCost(toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): number;
/**
 * Get all available operations for a tool category
 */
declare function getToolOperations(toolCategory: keyof typeof TOOLS_PRICING): ToolOperation[];
/**
 * Get human-readable pricing info for UI display
 */
declare function getToolPricingDisplay(toolCategory: keyof typeof TOOLS_PRICING, operationType: string): {
    baseCost: number;
    description: string;
    multipliers?: Record<string, string>;
};
/**
 * Examples of common operations and their costs
 */
declare const PRICING_EXAMPLES: {
    readonly "Basic image generation": number;
    readonly "High-quality image": number;
    readonly "Short video (5s)": number;
    readonly "HD video (10s)": number;
    readonly "Script generation": number;
    readonly "Prompt enhancement": number;
};

interface BalanceTransaction {
    userId: string;
    operationType: string;
    operationCategory: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
interface BalanceCheckResult {
    hasEnoughBalance: boolean;
    currentBalance: number;
    requiredBalance: number;
    shortfall?: number;
}
/**
 * Check if user has enough balance for an operation
 */
declare function checkOperationBalance(currentBalance: number, toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): BalanceCheckResult;
/**
 * Calculate the cost for an operation without checking balance
 */
declare function getOperationCost(toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): number;
/**
 * Create a balance transaction record
 */
declare function createBalanceTransaction(userId: string, operationType: string, operationCategory: string, balanceBefore: number, balanceAfter: number, metadata?: Record<string, any>): BalanceTransaction;
/**
 * Get pricing information for UI display
 */
declare function getPricingInfo(toolCategory: keyof typeof TOOLS_PRICING, operationType: string): {
    baseCost: any;
    name: any;
    description: any;
    multipliers: any;
} | null;

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

export { type APIResponse, API_ROUTES, type AuthCredentials, type BalanceCheckResult, type BalanceTransaction, ENDPOINTS, FREE_BALANCE_BY_USER_TYPE, type GenerationConfig, type GenerationRequest, type GenerationResponse, GenerationType, type ImageGenerationParams, type ImageGenerationResult, type ImageGenerationStrategy, ImageGenerationStrategyFactory, type ImageModel, type ImageToImageParams, ImageToImageStrategy, type ImageToVideoParams, ImageToVideoStrategy, ListOrder, type ModelConfig, PRICING_EXAMPLES, STRIPE_ENDPOINTS, StripeClient, type StripeCustomer, type StripePrice, type StripeSubscription, type StripeSubscriptionItem, SuperDuperAIClient, type SuperduperAIConfig, TOOLS_PRICING, TextToImageStrategy, TextToVideoStrategy, type ToolOperation, UploadClient, type UploadProgress, type UploadRequest, type UploadResponse, type UserType, type VideoGenerationParams, type VideoGenerationResult, type VideoGenerationStrategy, VideoGenerationStrategyFactory, type VideoModel, WebSocketClient, type WebSocketConfig, type WebSocketEvent, type WebSocketMessage, calculateOperationCost, checkOperationBalance, clearModelCache, createBalanceTransaction, generateImageWithStrategy, generateVideoWithStrategy, getCacheStats, getCachedModels, getClientSuperduperAIConfig, getOperationCost, getPricingInfo, getSuperduperAIConfig, getToolOperations, getToolPricingDisplay, stripeClient, superDuperAIClient, uploadClient, validateBearerToken, webSocketClient };

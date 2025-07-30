interface BaseArtifact {
    id: string;
    type: ArtifactType;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    status: ArtifactStatus;
    metadata?: Record<string, any>;
}
type ArtifactType = "image" | "video" | "text" | "sheet" | "script";
type ArtifactStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
interface ImageArtifact extends BaseArtifact {
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
interface ImageParameters {
    width: number;
    height: number;
    steps?: number;
    guidance?: number;
    seed?: number;
    model?: string;
    scheduler?: string;
}
interface VideoArtifact extends BaseArtifact {
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
interface VideoParameters {
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
interface TextArtifact extends BaseArtifact {
    type: "text";
    content: string;
    wordCount?: number;
    language?: string;
    model?: string;
    parameters?: TextParameters;
}
interface TextParameters {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    model?: string;
    systemPrompt?: string;
}
interface SheetArtifact extends BaseArtifact {
    type: "sheet";
    content: string;
    rows?: number;
    columns?: number;
    format?: "csv" | "xlsx" | "json";
    model?: string;
    parameters?: SheetParameters;
}
interface SheetParameters {
    rows: number;
    columns: number;
    headers?: string[];
    dataTypes?: string[];
    model?: string;
}
interface ScriptArtifact extends BaseArtifact {
    type: "script";
    content: string;
    language?: string;
    model?: string;
    parameters?: ScriptParameters;
}
interface ScriptParameters {
    language: string;
    framework?: string;
    dependencies?: string[];
    model?: string;
}
type Artifact = ImageArtifact | VideoArtifact | TextArtifact | SheetArtifact | ScriptArtifact;
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    type: "text" | "image" | "video" | "multimodal";
    capabilities: string[];
    parameters: Record<string, any>;
}
interface ApiConfig {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    retries?: number;
}
interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: "user" | "admin";
    createdAt: string;
    updatedAt: string;
}
interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}
interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    artifacts?: Artifact[];
    metadata?: Record<string, any>;
}
interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    isPublic: boolean;
}

declare const AI_MODELS: {
    readonly TEXT: {
        readonly GPT_4: "gpt-4";
        readonly GPT_3_5_TURBO: "gpt-3.5-turbo";
        readonly CLAUDE_3_OPUS: "claude-3-opus-20240229";
        readonly CLAUDE_3_SONNET: "claude-3-sonnet-20240229";
        readonly CLAUDE_3_HAIKU: "claude-3-haiku-20240307";
    };
    readonly IMAGE: {
        readonly DALL_E_3: "dall-e-3";
        readonly DALL_E_2: "dall-e-2";
        readonly MIDJOURNEY: "midjourney";
        readonly STABLE_DIFFUSION: "stable-diffusion";
    };
    readonly VIDEO: {
        readonly SORA: "sora";
        readonly VEOLABS: "veolabs";
        readonly RUNWAY: "runway";
        readonly PIKA: "pika";
    };
};
declare const STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
};
declare const ARTIFACT_TYPES: {
    readonly IMAGE: "image";
    readonly VIDEO: "video";
    readonly TEXT: "text";
    readonly SHEET: "sheet";
    readonly SCRIPT: "script";
};
declare const USER_ROLES: {
    readonly USER: "user";
    readonly ADMIN: "admin";
};
declare const MESSAGE_ROLES: {
    readonly USER: "user";
    readonly ASSISTANT: "assistant";
    readonly SYSTEM: "system";
};
declare const API_ENDPOINTS: {
    readonly ARTIFACTS: "/api/artifacts";
    readonly CHATS: "/api/chats";
    readonly USERS: "/api/users";
    readonly AUTH: "/api/auth";
};
declare const IMAGE_SIZES: {
    readonly THUMBNAIL: {
        readonly width: 150;
        readonly height: 150;
    };
    readonly SMALL: {
        readonly width: 512;
        readonly height: 512;
    };
    readonly MEDIUM: {
        readonly width: 1024;
        readonly height: 1024;
    };
    readonly LARGE: {
        readonly width: 1792;
        readonly height: 1024;
    };
};
declare const VIDEO_SIZES: {
    readonly SMALL: {
        readonly width: 512;
        readonly height: 512;
    };
    readonly MEDIUM: {
        readonly width: 1024;
        readonly height: 1024;
    };
    readonly LARGE: {
        readonly width: 1792;
        readonly height: 1024;
    };
};
declare const FILE_FORMATS: {
    readonly IMAGE: readonly ["jpg", "jpeg", "png", "webp", "gif"];
    readonly VIDEO: readonly ["mp4", "webm", "mov", "avi"];
    readonly DOCUMENT: readonly ["pdf", "doc", "docx", "txt"];
    readonly SPREADSHEET: readonly ["csv", "xlsx", "xls"];
};
declare const LIMITS: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_MESSAGE_LENGTH: 10000;
    readonly MAX_TITLE_LENGTH: 200;
    readonly MAX_DESCRIPTION_LENGTH: 1000;
    readonly MAX_CHAT_MESSAGES: 1000;
};
declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
declare const TIME: {
    readonly SECOND: 1000;
    readonly MINUTE: number;
    readonly HOUR: number;
    readonly DAY: number;
    readonly SESSION_TIMEOUT: number;
    readonly TOKEN_EXPIRY: number;
    readonly CACHE_TTL: number;
};
declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND_ERROR: "NOT_FOUND_ERROR";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
};
declare const NOTIFICATION_TYPES: {
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
};
declare const APP_URLS: {
    readonly ABOUT_URL: "/about";
    readonly PRICING_URL: "/pricing";
    readonly TERMS_URL: "/terms";
    readonly PRIVACY_URL: "/privacy";
    readonly EDITOR_URL: "/editor";
    readonly CALENDLY_URL: "https://calendly.com/superduperai";
    readonly INSTAGRAM_URL: "https://instagram.com/superduperai";
    readonly TELEGRAM_URL: "https://t.me/superduperai";
    readonly DISCORD_URL: "https://discord.gg/superduperai";
    readonly YOUTUBE_URL: "https://youtube.com/@superduperai";
    readonly TIKTOK_URL: "https://tiktok.com/@superduperai";
    readonly LINKEDIN_URL: "https://linkedin.com/company/superduperai";
};
declare const guestRegex: RegExp;

export { AI_MODELS, API_ENDPOINTS, APP_URLS, ARTIFACT_TYPES, type ApiConfig, type ApiResponse, type Artifact, type ArtifactStatus, type ArtifactType, type BaseArtifact, type Chat, ERROR_CODES, FILE_FORMATS, IMAGE_SIZES, type ImageArtifact, type ImageParameters, LIMITS, MESSAGE_ROLES, type Message, type ModelConfig, NOTIFICATION_TYPES, PAGINATION, type PaginatedResponse, STATUS, type ScriptArtifact, type ScriptParameters, type Session, type SheetArtifact, type SheetParameters, TIME, type TextArtifact, type TextParameters, USER_ROLES, type User, VIDEO_SIZES, type VideoArtifact, type VideoParameters, guestRegex };

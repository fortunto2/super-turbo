import { z } from 'zod';

interface ImageGenerationParams {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    steps?: number;
    cfgScale?: number;
    seed?: number;
    model?: string;
}
interface ImageToImageParams extends ImageGenerationParams {
    inputImage: string;
    strength?: number;
    denoisingStrength?: number;
}
interface ImageGenerationResult {
    id: string;
    imageUrl: string;
    metadata: {
        prompt: string;
        negativePrompt?: string;
        width: number;
        height: number;
        steps: number;
        cfgScale: number;
        seed: number;
        model: string;
        generationTime: number;
    };
    status: "pending" | "processing" | "completed" | "failed";
    error?: string;
}
interface ImageGenerationConfig {
    defaultModel: string;
    maxSteps: number;
    maxCfgScale: number;
    supportedResolutions: Array<{
        width: number;
        height: number;
    }>;
    defaultStrength: number;
}

declare class TextToImageStrategy {
    private client;
    generate(params: ImageGenerationParams): Promise<ImageGenerationResult>;
    private validateParams;
}
declare const textToImageStrategy: TextToImageStrategy;

declare class ImageToImageStrategy {
    private client;
    generate(params: ImageToImageParams): Promise<ImageGenerationResult>;
    private validateParams;
}
declare const imageToImageStrategy: ImageToImageStrategy;

interface InpaintingParams extends ImageToImageParams {
    mask: string;
    maskBlur?: number;
}
declare class InpaintingStrategy {
    private client;
    generate(params: InpaintingParams): Promise<ImageGenerationResult>;
    private validateParams;
}
declare const inpaintingStrategy: InpaintingStrategy;

declare const DEFAULT_IMAGE_CONFIG: ImageGenerationConfig;
type ImageGenType = "text-to-image" | "image-to-image";
declare class ImageGenerationUtils {
    /**
     * Validate if resolution is supported
     */
    static isResolutionSupported(width: number, height: number): boolean;
    /**
     * Get closest supported resolution
     */
    static getClosestResolution(width: number, height: number): {
        width: number;
        height: number;
    };
    /**
     * Calculate aspect ratio
     */
    static getAspectRatio(width: number, height: number): number;
    /**
     * Check if image is square
     */
    static isSquare(width: number, height: number): boolean;
    /**
     * Check if image is portrait
     */
    static isPortrait(width: number, height: number): boolean;
    /**
     * Check if image is landscape
     */
    static isLandscape(width: number, height: number): boolean;
    /**
     * Generate a random seed
     */
    static generateRandomSeed(): number;
    /**
     * Validate prompt length
     */
    static validatePromptLength(prompt: string, maxLength?: number): boolean;
    /**
     * Sanitize prompt text
     */
    static sanitizePrompt(prompt: string): string;
    /**
     * Normalize image generation type
     */
    static normalizeImageGenerationType(value: any): ImageGenType;
    /**
     * Ensure non-empty prompt with fallback
     */
    static ensureNonEmptyPrompt(input: any, fallback: string): string;
    /**
     * Select image-to-image model
     */
    static selectImageToImageModel(rawModelName: string, getAvailableImageModels: () => Promise<any[]>, options?: {
        allowInpainting?: boolean;
    }): Promise<string | null>;
}

interface VideoGenerationParams {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    duration: number;
    fps?: number;
    model?: string;
    seed?: number;
}
interface VideoToVideoParams extends VideoGenerationParams {
    inputVideo: string;
    strength?: number;
}
interface VideoGenerationResult {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    metadata: {
        prompt: string;
        negativePrompt?: string;
        width: number;
        height: number;
        duration: number;
        fps: number;
        model: string;
        seed: number;
        generationTime: number;
    };
    status: "pending" | "processing" | "completed" | "failed";
    error?: string;
    progress?: number;
}
interface VideoGenerationConfig {
    defaultModel: string;
    maxDuration: number;
    minDuration: number;
    supportedFps: number[];
    supportedResolutions: Array<{
        width: number;
        height: number;
    }>;
    defaultStrength: number;
}

declare class TextToVideoStrategy {
    private client;
    generate(params: VideoGenerationParams): Promise<VideoGenerationResult>;
    private validateParams;
}
declare const textToVideoStrategy: TextToVideoStrategy;

declare class VideoToVideoStrategy {
    private client;
    generate(params: VideoToVideoParams): Promise<VideoGenerationResult>;
    private validateParams;
}
declare const videoToVideoStrategy: VideoToVideoStrategy;

declare const DEFAULT_VIDEO_CONFIG: VideoGenerationConfig;
declare class VideoGenerationUtils {
    /**
     * Validate if resolution is supported
     */
    static isResolutionSupported(width: number, height: number): boolean;
    /**
     * Get closest supported resolution
     */
    static getClosestResolution(width: number, height: number): {
        width: number;
        height: number;
    };
    /**
     * Validate duration
     */
    static validateDuration(duration: number): boolean;
    /**
     * Validate FPS
     */
    static validateFps(fps: number): boolean;
    /**
     * Get closest supported FPS
     */
    static getClosestFps(fps: number): number;
    /**
     * Calculate video file size estimate
     */
    static estimateFileSize(width: number, height: number, duration: number, fps: number): number;
}

interface UserBalance {
    userId: string;
    credits: number;
    currency: string;
    lastUpdated: string;
}
interface CreditTransaction {
    id: string;
    userId: string;
    amount: number;
    type: "purchase" | "usage" | "refund" | "bonus";
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
}
interface CreditUsage {
    service: "image-generation" | "video-generation" | "audio-generation";
    cost: number;
    timestamp: string;
    metadata?: Record<string, any>;
}
interface BalanceConfig {
    imageGenerationCost: number;
    videoGenerationCost: number;
    audioGenerationCost: number;
    currency: string;
    minCreditsForPurchase: number;
}

declare class BalanceService {
    private client;
    getUserBalance(userId: string): Promise<UserBalance>;
    addCredits(userId: string, amount: number, type: "purchase" | "bonus"): Promise<CreditTransaction>;
    useCredits(userId: string, usage: CreditUsage): Promise<CreditTransaction>;
    getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<CreditTransaction[]>;
    getBalanceConfig(): Promise<BalanceConfig>;
}
declare const balanceService: BalanceService;

type ArtifactKind = "image" | "text" | "sheet" | "video";
interface Artifact {
    id: string;
    userId: string;
    type: "image" | "video" | "audio" | "document";
    url: string;
    thumbnailUrl?: string;
    filename: string;
    size: number;
    mimeType: string;
    metadata: {
        prompt?: string;
        model?: string;
        generationParams?: Record<string, any>;
        createdAt: string;
        updatedAt: string;
    };
    tags?: string[];
    isPublic: boolean;
}
interface ArtifactCollection {
    id: string;
    userId: string;
    name: string;
    description?: string;
    artifacts: string[];
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
}
interface ArtifactSearchParams {
    userId?: string;
    type?: "image" | "video" | "audio" | "document";
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}
interface SaveDocumentProps {
    id: string;
    title: string;
    kind: ArtifactKind;
    content: string;
    userId: string;
    visibility?: "public" | "private";
}
interface CreateDocumentCallbackProps {
    id: string;
    title: string;
    content?: string;
    dataStream: any;
    session: any;
}
interface UpdateDocumentCallbackProps {
    document: any;
    description: string;
    dataStream: any;
    session: any;
}
interface DocumentHandler<T = ArtifactKind> {
    kind: T;
    onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
    onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

declare class ArtifactService {
    private client;
    getArtifact(id: string): Promise<Artifact>;
    getUserArtifacts(userId: string, params?: ArtifactSearchParams): Promise<Artifact[]>;
    createArtifact(artifact: Omit<Artifact, "id" | "metadata">): Promise<Artifact>;
    updateArtifact(id: string, updates: Partial<Artifact>): Promise<Artifact>;
    deleteArtifact(id: string): Promise<void>;
    getCollections(userId: string): Promise<ArtifactCollection[]>;
    createCollection(collection: Omit<ArtifactCollection, "id" | "createdAt" | "updatedAt">): Promise<ArtifactCollection>;
    addArtifactToCollection(collectionId: string, artifactId: string): Promise<void>;
    static getThumbnailUrl(content: string): string | null;
    static createDocumentHandler<T extends ArtifactKind>(config: {
        kind: T;
        onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
        onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
    }): DocumentHandler<T>;
}
declare const artifactService: ArtifactService;

interface DataStreamWriter$1 {
    writeData: (data: {
        type: string;
        content: any;
    }) => void;
}
interface ToolFunction$1 {
    description: string;
    parameters: any;
    execute: (params: any) => Promise<any>;
}
interface Session$1 {
    user?: {
        id: string;
        email?: string;
    };
}
interface CreateDocumentProps {
    session: Session$1;
    dataStream: DataStreamWriter$1;
}
declare const createDocument: ({ session, dataStream }: CreateDocumentProps) => ToolFunction$1;
interface UpdateDocumentProps {
    session: Session$1;
    dataStream: DataStreamWriter$1;
}
declare const updateDocument: ({ session, dataStream }: UpdateDocumentProps) => ToolFunction$1;
interface RequestSuggestionsProps {
    session: Session$1;
    dataStream: DataStreamWriter$1;
}
declare const requestSuggestions: ({ session, dataStream, }: RequestSuggestionsProps) => ToolFunction$1;

interface MediaOption {
    id: string;
    name: string;
    label: string;
    description?: string;
    category?: string;
    tags?: string[];
}
interface AIGenerationConfig {
    availableModels: MediaOption[];
    availableResolutions: MediaOption[];
    availableStyles: MediaOption[];
    availableShotSizes: MediaOption[];
    defaultSettings: {
        model: string;
        resolution: string;
        style: string;
        shotSize: string;
    };
}
interface AIImageGenerationConfig extends AIGenerationConfig {
    supportedFormats: string[];
    maxBatchSize: number;
    qualityOptions: MediaOption[];
}
interface AIVideoGenerationConfig extends AIGenerationConfig {
    supportedDurations: number[];
    supportedFps: number[];
    maxDuration: number;
    qualityPresets: MediaOption[];
}
interface AIScriptGenerationConfig {
    availableTemplates: MediaOption[];
    availableGenres: MediaOption[];
    availableFormats: MediaOption[];
    maxLength: number;
    defaultSettings: {
        template: string;
        genre: string;
        format: string;
    };
}
interface ConfigurationResult {
    config: AIGenerationConfig | AIImageGenerationConfig | AIVideoGenerationConfig | AIScriptGenerationConfig;
    message: string;
    suggestions?: string[];
    nextSteps?: string[];
}

declare const configureImageGenerationSchema: z.ZodObject<{
    prompt: z.ZodOptional<z.ZodString>;
    sourceImageUrl: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    shotSize: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    seed: z.ZodOptional<z.ZodNumber>;
    batchSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    prompt?: string | undefined;
    sourceImageUrl?: string | undefined;
    style?: string | undefined;
    resolution?: string | undefined;
    shotSize?: string | undefined;
    model?: string | undefined;
    seed?: number | undefined;
    batchSize?: number | undefined;
}, {
    prompt?: string | undefined;
    sourceImageUrl?: string | undefined;
    style?: string | undefined;
    resolution?: string | undefined;
    shotSize?: string | undefined;
    model?: string | undefined;
    seed?: number | undefined;
    batchSize?: number | undefined;
}>;
type ConfigureImageGenerationParams = z.infer<typeof configureImageGenerationSchema>;
declare class ImageGenerationConfigurationTool {
    private client;
    /**
     * Configure image generation settings
     */
    configureImageGeneration(params: ConfigureImageGenerationParams): Promise<ConfigurationResult>;
    /**
     * Get image generation configuration
     */
    getImageGenerationConfig(): Promise<AIImageGenerationConfig>;
    /**
     * Start image generation
     */
    private startImageGeneration;
    /**
     * Parse media options from API response
     */
    private parseMediaOptions;
    /**
     * Get default image generation configuration
     */
    private getDefaultImageConfig;
}
declare const imageGenerationConfigurationTool: ImageGenerationConfigurationTool;

declare const videoGenerationConfigurationTool: {};

declare const scriptGenerationConfigurationTool: {};

interface ToolFunction {
    description: string;
    parameters: any;
    execute: (params: any) => Promise<any>;
}
interface Session {
    user?: {
        id: string;
        email?: string;
    };
}
interface CreateImageDocumentParams {
    createDocument: any;
    session?: Session | null;
    defaultSourceImageUrl?: string;
}
declare const configureImageGeneration: (params?: CreateImageDocumentParams) => ToolFunction;

interface CreateVideoDocumentParams {
    createDocument: any;
    session?: any;
}
declare const configureVideoGeneration: (params?: CreateVideoDocumentParams) => any;

declare const listVideoModels: any;
declare const findBestVideoModel: any;

interface PromptEnhancementParams {
    prompt: string;
    language?: string;
    style?: 'professional' | 'creative' | 'technical' | 'casual';
    length?: 'short' | 'medium' | 'long';
    targetModel?: 'image' | 'video' | 'text';
    includeExamples?: boolean;
}
interface EnhancedPrompt {
    original: string;
    enhanced: string;
    suggestions: string[];
    confidence: number;
    metadata: {
        language: string;
        style: string;
        length: string;
        targetModel: string;
        wordCount: number;
        estimatedTokens: number;
    };
}
interface PromptStyle {
    id: string;
    name: string;
    description: string;
    examples: string[];
    keywords: string[];
}
interface LanguageSupport {
    code: string;
    name: string;
    nativeName: string;
    supported: boolean;
}

declare class PromptEnhancer {
    private client;
    private static readonly DEFAULT_STYLES;
    private static readonly SUPPORTED_LANGUAGES;
    /**
     * Enhance a prompt using AI
     */
    enhancePrompt(params: PromptEnhancementParams): Promise<EnhancedPrompt>;
    /**
     * Get available prompt styles
     */
    getPromptStyles(): PromptStyle[];
    /**
     * Get supported languages
     */
    getSupportedLanguages(): LanguageSupport[];
    /**
     * Get style by ID
     */
    getStyleById(styleId: string): PromptStyle | undefined;
    /**
     * Get language by code
     */
    getLanguageByCode(code: string): LanguageSupport | undefined;
    /**
     * Validate enhancement parameters
     */
    private validateParams;
    /**
     * Count words in text
     */
    private countWords;
    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokens;
}
declare const promptEnhancer: PromptEnhancer;

interface ScriptGenerationParams {
    topic: string;
    genre?: 'drama' | 'comedy' | 'action' | 'romance' | 'thriller' | 'documentary' | 'educational';
    length?: 'short' | 'medium' | 'long';
    format?: 'markdown' | 'plain' | 'structured' | 'screenplay';
    targetAudience?: 'children' | 'teens' | 'adults' | 'general';
    tone?: 'serious' | 'humorous' | 'inspirational' | 'informative';
    includeDialogue?: boolean;
    includeStageDirections?: boolean;
}
interface GeneratedScript {
    id: string;
    topic: string;
    script: string;
    outline: ScriptOutline[];
    metadata: ScriptMetadata;
    createdAt: string;
    status: 'draft' | 'completed' | 'revised';
}
interface ScriptOutline {
    section: string;
    title: string;
    description: string;
    duration?: string;
    keyPoints: string[];
}
interface ScriptMetadata {
    genre: string;
    estimatedDuration: string;
    scenes: number;
    characters: number;
    wordCount: number;
    targetAudience: string;
    tone: string;
    format: string;
    language: string;
}
interface ScriptTemplate {
    id: string;
    name: string;
    description: string;
    structure: string[];
    examples: string[];
    genre: string[];
    suitableFor: string[];
}

declare class ScriptGenerator {
    private client;
    private static readonly DEFAULT_TEMPLATES;
    /**
     * Generate a script using AI
     */
    generateScript(params: ScriptGenerationParams): Promise<GeneratedScript>;
    /**
     * Get available script templates
     */
    getScriptTemplates(): ScriptTemplate[];
    /**
     * Get template by ID
     */
    getTemplateById(templateId: string): ScriptTemplate | undefined;
    /**
     * Get templates by genre
     */
    getTemplatesByGenre(genre: string): ScriptTemplate[];
    /**
     * Get templates suitable for target audience
     */
    getTemplatesByAudience(audience: string): ScriptTemplate[];
    /**
     * Validate generation parameters
     */
    private validateParams;
    /**
     * Check if genre is valid
     */
    private isValidGenre;
    /**
     * Check if length is valid
     */
    private isValidLength;
    /**
     * Check if format is valid
     */
    private isValidFormat;
    /**
     * Parse outline from API response
     */
    private parseOutline;
    /**
     * Parse metadata from API response and params
     */
    private parseMetadata;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Count words in text
     */
    private countWords;
}
declare const scriptGenerator: ScriptGenerator;

declare const enhancePromptSchema: z.ZodObject<{
    originalPrompt: z.ZodString;
    mediaType: z.ZodOptional<z.ZodEnum<["image", "video", "text", "general"]>>;
    enhancementLevel: z.ZodOptional<z.ZodEnum<["basic", "detailed", "creative"]>>;
    targetAudience: z.ZodOptional<z.ZodString>;
    includeNegativePrompt: z.ZodOptional<z.ZodBoolean>;
    modelHint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    originalPrompt: string;
    mediaType?: "image" | "text" | "video" | "general" | undefined;
    enhancementLevel?: "detailed" | "creative" | "basic" | undefined;
    targetAudience?: string | undefined;
    includeNegativePrompt?: boolean | undefined;
    modelHint?: string | undefined;
}, {
    originalPrompt: string;
    mediaType?: "image" | "text" | "video" | "general" | undefined;
    enhancementLevel?: "detailed" | "creative" | "basic" | undefined;
    targetAudience?: string | undefined;
    includeNegativePrompt?: boolean | undefined;
    modelHint?: string | undefined;
}>;
type EnhancePromptParams = z.infer<typeof enhancePromptSchema>;
interface EnhancedPromptResult {
    originalPrompt: string;
    enhancedPrompt: string;
    negativePrompt?: string;
    mediaType: string;
    enhancementLevel: string;
    modelHint?: string;
    improvements: string[];
    reasoning: string;
    usage: {
        copyPrompt: string;
        negativePrompt?: string;
    };
}
declare class PromptEnhancementTool {
    private client;
    /**
     * Enhance a prompt using AI
     */
    enhancePrompt(params: EnhancePromptParams): Promise<EnhancedPromptResult>;
    /**
     * Build system prompt for enhancement
     */
    private buildSystemPrompt;
    /**
     * Get media-specific enhancement instructions
     */
    private getMediaSpecificInstructions;
    /**
     * Get level-specific enhancement instructions
     */
    private getLevelSpecificInstructions;
    /**
     * Get model-specific optimization instructions
     */
    private getModelSpecificInstructions;
}
declare const promptEnhancementTool: PromptEnhancementTool;

declare const enhancePrompt: (config?: any) => {
    description: string;
    parameters: {
        originalPrompt: {
            type: string;
            description: string;
        };
        mediaType: {
            type: string;
            enum: string[];
            optional: boolean;
        };
        enhancementLevel: {
            type: string;
            enum: string[];
            optional: boolean;
        };
        targetAudience: {
            type: string;
            optional: boolean;
        };
        includeNegativePrompt: {
            type: string;
            optional: boolean;
        };
        modelHint: {
            type: string;
            optional: boolean;
        };
    };
    execute: (params: any) => Promise<EnhancedPrompt>;
};

declare const configureScriptGeneration: (config?: any) => {
    description: string;
    parameters: {
        topic: {
            type: string;
            description: string;
        };
        genre: {
            type: string;
            enum: string[];
            optional: boolean;
        };
        length: {
            type: string;
            enum: string[];
            optional: boolean;
        };
        format: {
            type: string;
            enum: string[];
            optional: boolean;
        };
        targetAudience: {
            type: string;
            optional: boolean;
        };
        tone: {
            type: string;
            optional: boolean;
        };
        includeDialogue: {
            type: string;
            optional: boolean;
        };
        includeStageDirections: {
            type: string;
            optional: boolean;
        };
    };
    execute: (params: any) => Promise<GeneratedScript>;
};

interface ChatModel {
    id: string;
    name: string;
    description: string;
    capabilities?: string[];
    maxTokens?: number;
    temperature?: number;
}
interface AIProvider {
    id: string;
    name: string;
    type: 'azure' | 'openai' | 'anthropic' | 'custom';
    config: Record<string, any>;
    models: ChatModel[];
}
interface ModelConfig {
    apiKey: string;
    baseURL?: string;
    apiVersion?: string;
    headers?: Record<string, string>;
    timeout?: number;
}
interface GenerationConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

declare const defaultAIProvider: AIProvider;
declare const myProvider: {
    languageModel: (modelId: string) => any;
};
declare const getProviderById: (id: string) => AIProvider | undefined;
declare const getAllProviders: () => AIProvider[];
declare const validateProviderConfig: (config: ModelConfig) => boolean;
declare const createCustomProvider: (id: string, name: string, config: ModelConfig, models?: any[]) => AIProvider;

declare const DEFAULT_CHAT_MODEL: string;
declare const chatModels: Array<ChatModel>;
declare const getModelById: (id: string) => ChatModel | undefined;
declare const getModelsByCapability: (capability: string) => ChatModel[];
declare const getDefaultModel: () => ChatModel;

declare const chatModel: {
    id: string;
    name: string;
    description: string;
    doGenerate: () => Promise<{
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
        finishReason: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
        text: string;
    }>;
    doStream: (params: {
        prompt: string;
    }) => Promise<{
        stream: {
            chunks: ({
                type: string;
                textDelta: string;
                finishReason?: undefined;
                logprobs?: undefined;
                usage?: undefined;
            } | {
                type: string;
                finishReason: string;
                logprobs: undefined;
                usage: {
                    completionTokens: number;
                    promptTokens: number;
                };
                textDelta?: undefined;
            })[];
        };
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
    }>;
};
declare const reasoningModel: {
    id: string;
    name: string;
    description: string;
    doGenerate: () => Promise<{
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
        finishReason: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
        text: string;
        reasoning: string;
    }>;
    doStream: (params: {
        prompt: string;
    }) => Promise<{
        stream: {
            chunks: ({
                type: string;
                textDelta: string;
                finishReason?: undefined;
                logprobs?: undefined;
                usage?: undefined;
            } | {
                type: string;
                finishReason: string;
                logprobs: undefined;
                usage: {
                    completionTokens: number;
                    promptTokens: number;
                };
                textDelta?: undefined;
            })[];
        };
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
    }>;
};
declare const titleModel: {
    id: string;
    name: string;
    description: string;
    doGenerate: () => Promise<{
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
        finishReason: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
        text: string;
    }>;
    doStream: () => Promise<{
        stream: {
            chunks: ({
                type: string;
                textDelta: string;
                finishReason?: undefined;
                logprobs?: undefined;
                usage?: undefined;
            } | {
                type: string;
                finishReason: string;
                logprobs: undefined;
                usage: {
                    completionTokens: number;
                    promptTokens: number;
                };
                textDelta?: undefined;
            })[];
        };
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
    }>;
};
declare const artifactModel: {
    id: string;
    name: string;
    description: string;
    doGenerate: () => Promise<{
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
        finishReason: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
        text: string;
    }>;
    doStream: (params: {
        prompt: string;
    }) => Promise<{
        stream: {
            chunks: ({
                type: string;
                textDelta: string;
                finishReason?: undefined;
                logprobs?: undefined;
                usage?: undefined;
            } | {
                type: string;
                finishReason: string;
                logprobs: undefined;
                usage: {
                    completionTokens: number;
                    promptTokens: number;
                };
                textDelta?: undefined;
            })[];
        };
        rawCall: {
            rawPrompt: null;
            rawSettings: {};
        };
    }>;
};

interface PromptCategory {
    id: string;
    name: string;
    description: string;
    content: string;
}
interface PromptTemplate {
    id: string;
    name: string;
    category: string;
    template: string;
    variables: string[];
    description: string;
}
interface PromptContext {
    userType?: string;
    language?: string;
    tool?: string;
    complexity?: "simple" | "medium" | "advanced";
}
interface PromptEnhancementOptions {
    language?: string;
    style?: "casual" | "formal" | "technical" | "creative";
    length?: "short" | "medium" | "long";
    detail?: "basic" | "detailed" | "comprehensive";
}
interface ToolPrompt {
    toolName: string;
    description: string;
    usage: string;
    examples: string[];
    parameters?: string[];
    restrictions?: string[];
}
interface PromptLibrary {
    categories: PromptCategory[];
    templates: PromptTemplate[];
    tools: ToolPrompt[];
    version: string;
    lastUpdated: string;
}
interface RequestHints {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
}
type PromptArtifactKind = "text" | "sheet" | "image" | "video" | "script";

declare const artifactsPrompt = "\nArtifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.\n\nWhen asked to write content, always use artifacts when appropriate.\n\nDO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.\n\nThis is a guide for using artifacts tools: `createDocument` and `updateDocument`, which render content on a artifacts beside the conversation.\n\n**When to use `createDocument`:**\n- For substantial content (>10 lines)\n- For content users will likely save/reuse (emails, essays, etc.)\n- When explicitly requested to create a document\n\n**When NOT to use `createDocument`:**\n- For informational/explanatory content\n- For conversational responses\n- When asked to keep it in chat\n\n**Special rule for script/scenario/story requests:**\n- If the user requests a script, scenario, story, play, or similar (including in Russian: \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439, \u0440\u0430\u0441\u0441\u043A\u0430\u0437, \u043F\u044C\u0435\u0441\u0430, \u0441\u044E\u0436\u0435\u0442, \u0438\u043D\u0441\u0446\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430, etc.), ALWAYS use the `configureScriptGeneration` tool to generate the script artifact. Do NOT generate the script directly in the chat. The script must be created as an artifact using the tool.\n\n**Using `updateDocument`:**\n- Default to full document rewrites for major changes\n- Use targeted updates only for specific, isolated changes\n- Follow user instructions for which parts to modify\n\n**When NOT to use `updateDocument`:**\n- Immediately after creating a document\n\nDo not update document right after creating it. Wait for user feedback or request to update it.\n\n**Using `configureImageGeneration`:**\n- When user requests image generation configuration/settings, call configureImageGeneration WITHOUT prompt parameter\n- When user provides specific image description, call configureImageGeneration WITH prompt parameter to generate directly\n- With prompt: Immediately creates an image artifact and starts generation with real-time progress tracking via WebSocket\n- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, and seed\n- Optional parameters: style, resolution, shotSize, model (can be specified in either mode)\n- The system will automatically create an image artifact that shows generation progress and connects to WebSocket for real-time updates\n- Be conversational and encouraging about the image generation process\n- Example for settings: \"I'll set up the image generation settings for you to configure...\"\n- Example for direct generation: \"I'll generate that image for you right now! Creating an image artifact...\"\n\n**Image-to-Image (editing an existing image):**\n- If the user's message contains an image attachment AND an edit/transform request, treat this as image-to-image.\n  - Russian intent examples: \"\u0441\u0434\u0435\u043B\u0430\u0439\", \"\u043F\u043E\u0434\u043F\u0440\u0430\u0432\u044C\", \"\u0437\u0430\u043C\u0435\u043D\u0438\", \"\u0438\u0441\u043F\u0440\u0430\u0432\u044C\", \"\u0441\u0434\u0435\u043B\u0430\u0439 \u0433\u043B\u0430\u0437\u0430 \u0433\u043E\u043B\u0443\u0431\u044B\u043C\u0438\", \"\u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u044D\u0442\u0443 \u0444\u043E\u0442\u043A\u0443\", \"\u043D\u0430 \u044D\u0442\u043E\u0439 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0435\".\n  - English intent examples: \"make\", \"change\", \"edit\", \"fix\", \"enhance\", \"on this image\".\n- In this case call `configureImageGeneration` WITH:\n  - `prompt`: the user's edit instruction (enhance/translate if needed)\n  - `sourceImageUrl`: take from the latest image attachment of the user's message (or the most recent image attachment in the chat if the message references \"this image\").\n- If multiple images are present, ask which one to use unless the user clearly refers to the last one.\n- If the user uploads an image without text, use a safe default prompt like \"Enhance this image\" and proceed.\n- Always prefer image-to-image when an image attachment is present and the instruction implies editing that image.\n\n**Using `configureVideoGeneration`:**\n- When user requests video generation configuration/settings, call configureVideoGeneration WITHOUT prompt parameter\n- When user provides specific video description, call configureVideoGeneration WITH prompt parameter to generate directly\n- With prompt: Immediately creates a video artifact and starts generation with real-time progress tracking via WebSocket\n- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, frame rate, duration, negative prompt, and seed\n- Optional parameters: style, resolution, shotSize, model, frameRate, duration, negativePrompt, sourceImageId, sourceImageUrl (can be specified in either mode)\n- **Default Economical Settings (for cost efficiency):**\n  - **Resolution:** 1344x768 HD (16:9) - Good quality, lower cost than Full HD\n  - **Duration:** 5 seconds - Shorter videos cost less\n  - **Quality:** HD instead of Full HD - Balanced quality/cost ratio\n  - Always mention these economical defaults when generating videos\n- **Model Types:**\n  - **Text-to-Video Models:** Generate videos from text prompts only\n    - **LTX** (comfyui/ltx) - 0.40  USD per second, no VIP required, 5s max - Best value option\n    - **Sora** (azure-openai/sora) - 2.00 USD per second, VIP required, up to 20s - Longest duration\n  - **Image-to-Video Models:** Require source image + text prompt\n    - **VEO3** (google-cloud/veo3) - 3.00 USD per second, VIP required, 5-8s - Premium quality\n    - **VEO2** (google-cloud/veo2) - 2.00 USD per second, VIP required, 5-8s - High quality  \n    - **KLING 2.1** (fal-ai/kling-video/v2.1/standard/image-to-video) - 1.00 USD per second, VIP required, 5-10s\n- **For Image-to-Video Models:** When user selects VEO, KLING or other image-to-video models:\n  - ALWAYS ask for source image if not provided\n  - Suggest using recently generated images from the chat\n  - Use sourceImageId parameter for images from this chat\n  - Use sourceImageUrl parameter for external image URLs\n  - Example: \"VEO2 is an image-to-video model that needs a source image. Would you like to use the image you just generated, or do you have another image in mind?\"\n- The system will automatically create a video artifact that shows generation progress and connects to WebSocket for real-time updates\n- Be conversational and encouraging about the video generation process\n- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency\n- Example for settings: \"I'll set up the video generation settings for you to configure...\"\n- Example for direct generation: \"I'll generate that video for you right now using economical HD settings (1344x768, 5s) for cost efficiency! Creating a video artifact...\"\n\n**Using `listVideoModels`:**\n- Use this tool to discover available video generation models with their capabilities and pricing\n- Call with format: 'agent-friendly' for formatted descriptions, 'simple' for basic info, 'detailed' for full specs\n- Filter by price, duration support, or exclude VIP models as needed\n- Always check available models before making recommendations to users\n- Example: \"Let me check what video models are currently available...\"\n\n**Using `findBestVideoModel`:**\n- Use this tool to automatically select the optimal video model based on requirements\n- Specify maxPrice, preferredDuration, vipAllowed, or prioritizeQuality parameters\n- Returns the best model recommendation with usage tips\n- Use this when user has specific budget or quality requirements\n\n**Using `enhancePrompt`:**\n- When user wants to improve their prompt for better AI generation results\n- Call with the user's original prompt and enhancement preferences\n- Returns enhanced prompt with professional terminology and quality descriptors\n- Always mention that the artifact will show generation status, progress percentage, and the final video when ready\n- Highlight unique video features like frame rate, duration, and negative prompts for fine control\n- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency\n- **When enhancing:** Show both original and enhanced prompts to the user for transparency\n";
declare const regularPrompt = "You are a friendly assistant! Keep your responses concise and helpful.";
declare const getRequestPromptFromHints: (requestHints: RequestHints) => string;
declare const systemPrompt: ({ selectedChatModel, requestHints, }: {
    selectedChatModel: string;
    requestHints: RequestHints;
}) => string;
declare const codePrompt = "\nYou are a Python code generator that creates self-contained, executable code snippets. When writing code:\n\n1. Each snippet should be complete and runnable on its own\n2. Prefer using print() statements to display outputs\n3. Include helpful comments explaining the code\n4. Keep snippets concise (generally under 15 lines)\n5. Avoid external dependencies - use Python standard library\n6. Handle potential errors gracefully\n7. Return meaningful output that demonstrates the code's functionality\n8. Don't use input() or other interactive functions\n9. Don't access files or network resources\n10. Don't use infinite loops\n\nExamples of good snippets:\n\n# Calculate factorial iteratively\ndef factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result\n\nprint(f\"Factorial of 5 is: {factorial(5)}\")\n";
declare const sheetPrompt = "\nYou are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.\n";
declare const updateDocumentPrompt: (currentContent: string | null, type: PromptArtifactKind) => string;
declare const imageGenerationPrompt = "\nYou are an AI image generation expert. Your role is to help users create high-quality images using AI tools.\n\n**Key Responsibilities:**\n1. Understand user's image requirements and translate them into effective prompts\n2. Guide users through image generation settings and options\n3. Explain different models, styles, and resolution options\n4. Help optimize prompts for better results\n5. Provide feedback on generated images\n\n**Image Generation Process:**\n1. **Prompt Analysis:** Break down user requests into clear, specific image descriptions\n2. **Style Selection:** Recommend appropriate artistic styles and visual approaches\n3. **Technical Settings:** Guide users through resolution, aspect ratio, and quality options\n4. **Model Selection:** Help choose the best AI model for the specific use case\n5. **Iteration:** Suggest improvements based on generated results\n\n**Best Practices:**\n- Use descriptive, specific language\n- Include artistic style references when appropriate\n- Consider composition and lighting details\n- Balance creativity with technical precision\n- Encourage experimentation and iteration\n\n**Common Use Cases:**\n- Character portraits and illustrations\n- Landscape and nature scenes\n- Abstract and conceptual art\n- Product and commercial imagery\n- Fantasy and sci-fi artwork\n- Historical and cultural depictions\n\nAlways be encouraging and helpful, guiding users toward their creative vision while explaining the technical aspects of AI image generation.\n";
declare const videoGenerationPrompt = "\nYou are an AI video generation expert specializing in creating dynamic, engaging video content using advanced AI tools.\n\n**Core Expertise:**\n1. **Text-to-Video Generation:** Converting written descriptions into moving visual content\n2. **Image-to-Video Animation:** Bringing static images to life with motion\n3. **Style and Aesthetic Guidance:** Recommending visual approaches for different content types\n4. **Technical Optimization:** Balancing quality, duration, and cost considerations\n\n**Video Generation Capabilities:**\n- **Duration Options:** 5-20 seconds depending on model and settings\n- **Resolution Quality:** HD (1344x768) to Full HD (1920x1080) options\n- **Frame Rate Control:** 24-60 FPS for different motion styles\n- **Style Variety:** Cinematic, artistic, commercial, and experimental approaches\n- **Negative Prompts:** Fine-tune results by specifying what to avoid\n\n**Model Selection Guide:**\n- **LTX (Text-to-Video):** Best value, 5s max, no VIP required\n- **Sora (Text-to-Video):** Longest duration (20s), VIP required\n- **VEO3 (Image-to-Video):** Premium quality, 5-8s, VIP required\n- **VEO2 (Image-to-Video):** High quality, 5-8s, VIP required\n- **KLING 2.1 (Image-to-Video):** Good value, 5-10s, VIP required\n\n**Cost Optimization:**\n- Recommend HD resolution (1344x768) for cost efficiency\n- Suggest 5-second duration for initial tests\n- Use economical models for experimentation\n- Explain VIP requirements for premium features\n\n**Creative Applications:**\n- Marketing and promotional content\n- Educational and explanatory videos\n- Artistic and experimental projects\n- Social media content creation\n- Product demonstrations\n- Storytelling and narrative content\n\nAlways emphasize the economical default settings (HD resolution, 5s duration) and guide users toward cost-effective choices while maintaining quality.\n";
declare const videoModelsPrompt = "\nYou are an AI video model expert who helps users understand and select the best video generation models for their needs.\n\n**Model Categories:**\n\n**Text-to-Video Models (Generate from text descriptions only):**\n- **LTX (comfyui/ltx):** 0.40 USD/sec, 5s max, no VIP required - Best value option\n- **Sora (azure-openai/sora):** 2.00 USD/sec, up to 20s, VIP required - Longest duration\n\n**Image-to-Video Models (Require source image + text):**\n- **VEO3 (google-cloud/veo3):** 3.00 USD/sec, 5-8s, VIP required - Premium quality\n- **VEO2 (google-cloud/veo2):** 2.00 USD/sec, 5-8s, VIP required - High quality\n- **KLING 2.1 (fal-ai/kling-video/v2.1/standard/image-to-video):** 1.00 USD/sec, 5-10s, VIP required\n\n**Selection Factors:**\n1. **Budget:** LTX for cost-conscious users, VEO3 for premium quality\n2. **Duration:** Sora for longer videos, others for shorter content\n3. **Input Type:** Text-only vs. image+text requirements\n4. **Quality:** VEO3 for highest quality, LTX for good value\n5. **VIP Access:** Some models require premium subscription\n\n**Recommendation Strategy:**\n- Start with LTX for cost efficiency and testing\n- Use Sora when longer duration is needed\n- Recommend VEO models for image-to-video with high quality requirements\n- Consider KLING 2.1 as a mid-range image-to-video option\n- Always check VIP requirements before suggesting premium models\n\n**Cost Calculation Examples:**\n- LTX 5s video: 5 \u00D7 0.40 = 2.00 USD\n- Sora 20s video: 20 \u00D7 2.00 = 40.00 USD\n- VEO3 8s video: 8 \u00D7 3.00 = 24.00 USD\n\nHelp users make informed decisions based on their budget, quality requirements, and content type.\n";
declare const scriptGenerationPrompt = "\nYou are an AI script generation expert who creates compelling, well-structured scripts for various media formats.\n\n**Script Types and Formats:**\n1. **Screenplays:** Film, TV, and web content with proper formatting\n2. **Stage Plays:** Theater productions with dialogue and stage directions\n3. **Podcast Scripts:** Audio content with timing and segment structure\n4. **Commercial Scripts:** Advertising and marketing content\n5. **Educational Scripts:** Tutorials, presentations, and learning materials\n6. **Story Scripts:** Narrative content for various media\n\n**Script Structure Elements:**\n- **Opening Hook:** Engaging introduction to capture attention\n- **Clear Objectives:** What the script aims to achieve\n- **Logical Flow:** Smooth progression from beginning to end\n- **Character Development:** Distinct voices and motivations\n- **Conflict and Resolution:** Engaging narrative arc\n- **Call to Action:** Clear next steps or desired response\n\n**Formatting Standards:**\n- Use proper industry formatting for the specific script type\n- Include scene headings, character names, and dialogue\n- Add parentheticals for character actions and emotions\n- Maintain consistent spacing and indentation\n- Follow genre-specific conventions and expectations\n\n**Content Quality Guidelines:**\n- Write engaging, natural dialogue\n- Create clear, visual scene descriptions\n- Maintain consistent tone and style\n- Include appropriate pacing and rhythm\n- Ensure logical story progression\n- Add creative elements that enhance engagement\n\n**Adaptation Considerations:**\n- Consider the target audience and platform\n- Adapt language and complexity appropriately\n- Include relevant cultural and contextual elements\n- Optimize for the specific medium's requirements\n- Ensure accessibility and inclusivity\n\nAlways create scripts that are engaging, well-structured, and ready for production or further development.\n";
declare const promptEnhancementPrompt = "\nYou are an AI prompt engineering expert who specializes in improving and optimizing prompts for better AI generation results.\n\n**Enhancement Techniques:**\n1. **Clarity and Specificity:** Make vague requests more precise and detailed\n2. **Technical Terminology:** Add appropriate technical and artistic terms\n3. **Style References:** Include relevant artistic styles and visual approaches\n4. **Quality Descriptors:** Add terms that improve output quality\n5. **Context and Background:** Provide additional context when helpful\n6. **Negative Prompts:** Specify what to avoid for better results\n\n**Enhancement Categories:**\n- **Image Generation:** Photography terms, artistic styles, composition guidance\n- **Video Generation:** Cinematography terms, motion descriptions, production quality\n- **Text Generation:** Writing styles, tone adjustments, structure improvements\n- **General Enhancement:** Clarity, specificity, and professional terminology\n\n**Quality Improvement Terms:**\n- **Visual Quality:** \"high resolution,\" \"sharp focus,\" \"professional photography\"\n- **Artistic Style:** \"masterpiece,\" \"award-winning,\" \"trending on artstation\"\n- **Technical Excellence:** \"excellent composition,\" \"rule of thirds,\" \"dramatic lighting\"\n- **Production Value:** \"cinematic quality,\" \"Hollywood production,\" \"IMAX quality\"\n\n**Enhancement Process:**\n1. **Analyze Original:** Understand the user's intent and requirements\n2. **Identify Gaps:** Find areas where specificity or detail can be added\n3. **Apply Techniques:** Use appropriate enhancement methods\n4. **Maintain Intent:** Preserve the original creative vision\n5. **Optimize Language:** Use clear, effective terminology\n6. **Provide Context:** Explain improvements and reasoning\n\n**Output Format:**\nProvide enhanced prompts with:\n- Clear, specific language\n- Appropriate technical terms\n- Quality descriptors\n- Style references when relevant\n- Negative prompts when helpful\n- Explanation of improvements made\n\nAlways enhance prompts while preserving the user's original creative intent and vision.\n";
declare const combinedToolsPrompt = "\n\nArtifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.\n\nWhen asked to write content, always use artifacts when appropriate.\n\nDO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.\n\nThis is a guide for using artifacts tools: `createDocument` and `updateDocument`, which render content on a artifacts beside the conversation.\n\n**When to use `createDocument`:**\n- For substantial content (>10 lines)\n- For content users will likely save/reuse (emails, essays, etc.)\n- When explicitly requested to create a document\n\n**When NOT to use `createDocument`:**\n- For informational/explanatory content\n- For conversational responses\n- When asked to keep it in chat\n\n**Special rule for script/scenario/story requests:**\n- If the user requests a script, scenario, story, play, or similar (including in Russian: \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439, \u0440\u0430\u0441\u0441\u043A\u0430\u0437, \u043F\u044C\u0435\u0441\u0430, \u0441\u044E\u0436\u0435\u0442, \u0438\u043D\u0441\u0446\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430, etc.), ALWAYS use the `configureScriptGeneration` tool to generate the script artifact. Do NOT generate the script directly in the chat. The script must be created as an artifact using the tool.\n\n**Using `updateDocument`:**\n- Default to full document rewrites for major changes\n- Use targeted updates only for specific, isolated changes\n- Follow user instructions for which parts to modify\n\n**When NOT to use `updateDocument`:**\n- Immediately after creating a document\n\nDo not update document right after creating it. Wait for user feedback or request to update it.\n\n**Using `configureImageGeneration`:**\n- When user requests image generation configuration/settings, call configureImageGeneration WITHOUT prompt parameter\n- When user provides specific image description, call configureImageGeneration WITH prompt parameter to generate directly\n- With prompt: Immediately creates an image artifact and starts generation with real-time progress tracking via WebSocket\n- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, and seed\n- Optional parameters: style, resolution, shotSize, model (can be specified in either mode)\n- The system will automatically create an image artifact that shows generation progress and connects to WebSocket for real-time updates\n- Be conversational and encouraging about the image generation process\n- Example for settings: \"I'll set up the image generation settings for you to configure...\"\n- Example for direct generation: \"I'll generate that image for you right now! Creating an image artifact...\"\n\n**Image-to-Image (editing an existing image):**\n- If the user's message contains an image attachment AND an edit/transform request, treat this as image-to-image.\n  - Russian intent examples: \"\u0441\u0434\u0435\u043B\u0430\u0439\", \"\u043F\u043E\u0434\u043F\u0440\u0430\u0432\u044C\", \"\u0437\u0430\u043C\u0435\u043D\u0438\", \"\u0438\u0441\u043F\u0440\u0430\u0432\u044C\", \"\u0441\u0434\u0435\u043B\u0430\u0439 \u0433\u043B\u0430\u0437\u0430 \u0433\u043E\u043B\u0443\u0431\u044B\u043C\u0438\", \"\u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u044D\u0442\u0443 \u0444\u043E\u0442\u043A\u0443\", \"\u043D\u0430 \u044D\u0442\u043E\u0439 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0435\".\n  - English intent examples: \"make\", \"change\", \"edit\", \"fix\", \"enhance\", \"on this image\".\n- In this case call `configureImageGeneration` WITH:\n  - `prompt`: the user's edit instruction (enhance/translate if needed)\n  - `sourceImageUrl`: take from the latest image attachment of the user's message (or the most recent image attachment in the chat if the message references \"this image\").\n- If multiple images are present, ask which one to use unless the user clearly refers to the last one.\n- If the user uploads an image without text, use a safe default prompt like \"Enhance this image\" and proceed.\n- Always prefer image-to-image when an image attachment is present and the instruction implies editing that image.\n\n**Using `configureVideoGeneration`:**\n- When user requests video generation configuration/settings, call configureVideoGeneration WITHOUT prompt parameter\n- When user provides specific video description, call configureVideoGeneration WITH prompt parameter to generate directly\n- With prompt: Immediately creates a video artifact and starts generation with real-time progress tracking via WebSocket\n- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, frame rate, duration, negative prompt, and seed\n- Optional parameters: style, resolution, shotSize, model, frameRate, duration, negativePrompt, sourceImageId, sourceImageUrl (can be specified in either mode)\n- **Default Economical Settings (for cost efficiency):**\n  - **Resolution:** 1344x768 HD (16:9) - Good quality, lower cost than Full HD\n  - **Duration:** 5 seconds - Shorter videos cost less\n  - **Quality:** HD instead of Full HD - Balanced quality/cost ratio\n  - Always mention these economical defaults when generating videos\n- **Model Types:**\n  - **Text-to-Video Models:** Generate videos from text prompts only\n    - **LTX** (comfyui/ltx) - 0.40  USD per second, no VIP required, 5s max - Best value option\n    - **Sora** (azure-openai/sora) - 2.00 USD per second, VIP required, up to 20s - Longest duration\n  - **Image-to-Video Models:** Require source image + text prompt\n    - **VEO3** (google-cloud/veo3) - 3.00 USD per second, VIP required, 5-8s - Premium quality\n    - **VEO2** (google-cloud/veo2) - 2.00 USD per second, VIP required, 5-8s - High quality  \n    - **KLING 2.1** (fal-ai/kling-video/v2.1/standard/image-to-video) - 1.00 USD per second, VIP required, 5-10s\n- **For Image-to-Video Models:** When user selects VEO, KLING or other image-to-video models:\n  - ALWAYS ask for source image if not provided\n  - Suggest using recently generated images from the chat\n  - Use sourceImageId parameter for images from this chat\n  - Use sourceImageUrl parameter for external image URLs\n  - Example: \"VEO2 is an image-to-video model that needs a source image. Would you like to use the image you just generated, or do you have another image in mind?\"\n- The system will automatically create a video artifact that shows generation progress and connects to WebSocket for real-time updates\n- Be conversational and encouraging about the video generation process\n- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency\n- Example for settings: \"I'll set up the video generation settings for you to configure...\"\n- Example for direct generation: \"I'll generate that video for you right now using economical HD settings (1344x768, 5s) for cost efficiency! Creating a video artifact...\"\n\n**Using `listVideoModels`:**\n- Use this tool to discover available video generation models with their capabilities and pricing\n- Call with format: 'agent-friendly' for formatted descriptions, 'simple' for basic info, 'detailed' for full specs\n- Filter by price, duration support, or exclude VIP models as needed\n- Always check available models before making recommendations to users\n- Example: \"Let me check what video models are currently available...\"\n\n**Using `findBestVideoModel`:**\n- Use this tool to automatically select the optimal video model based on requirements\n- Specify maxPrice, preferredDuration, vipAllowed, or prioritizeQuality parameters\n- Returns the best model recommendation with usage tips\n- Use this when user has specific budget or quality requirements\n\n**Using `enhancePrompt`:**\n- When user wants to improve their prompt for better AI generation results\n- Call with the user's original prompt and enhancement preferences\n- Returns enhanced prompt with professional terminology and quality descriptors\n- Always mention that the artifact will show generation status, progress percentage, and the final video when ready\n- Highlight unique video features like frame rate, duration, and negative prompts for fine control\n- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency\n- **When enhancing:** Show both original and enhanced prompts to the user for transparency\n\n\n\nYou are an AI image generation expert. Your role is to help users create high-quality images using AI tools.\n\n**Key Responsibilities:**\n1. Understand user's image requirements and translate them into effective prompts\n2. Guide users through image generation settings and options\n3. Explain different models, styles, and resolution options\n4. Help optimize prompts for better results\n5. Provide feedback on generated images\n\n**Image Generation Process:**\n1. **Prompt Analysis:** Break down user requests into clear, specific image descriptions\n2. **Style Selection:** Recommend appropriate artistic styles and visual approaches\n3. **Technical Settings:** Guide users through resolution, aspect ratio, and quality options\n4. **Model Selection:** Help choose the best AI model for the specific use case\n5. **Iteration:** Suggest improvements based on generated results\n\n**Best Practices:**\n- Use descriptive, specific language\n- Include artistic style references when appropriate\n- Consider composition and lighting details\n- Balance creativity with technical precision\n- Encourage experimentation and iteration\n\n**Common Use Cases:**\n- Character portraits and illustrations\n- Landscape and nature scenes\n- Abstract and conceptual art\n- Product and commercial imagery\n- Fantasy and sci-fi artwork\n- Historical and cultural depictions\n\nAlways be encouraging and helpful, guiding users toward their creative vision while explaining the technical aspects of AI image generation.\n\n\n\nYou are an AI video generation expert specializing in creating dynamic, engaging video content using advanced AI tools.\n\n**Core Expertise:**\n1. **Text-to-Video Generation:** Converting written descriptions into moving visual content\n2. **Image-to-Video Animation:** Bringing static images to life with motion\n3. **Style and Aesthetic Guidance:** Recommending visual approaches for different content types\n4. **Technical Optimization:** Balancing quality, duration, and cost considerations\n\n**Video Generation Capabilities:**\n- **Duration Options:** 5-20 seconds depending on model and settings\n- **Resolution Quality:** HD (1344x768) to Full HD (1920x1080) options\n- **Frame Rate Control:** 24-60 FPS for different motion styles\n- **Style Variety:** Cinematic, artistic, commercial, and experimental approaches\n- **Negative Prompts:** Fine-tune results by specifying what to avoid\n\n**Model Selection Guide:**\n- **LTX (Text-to-Video):** Best value, 5s max, no VIP required\n- **Sora (Text-to-Video):** Longest duration (20s), VIP required\n- **VEO3 (Image-to-Video):** Premium quality, 5-8s, VIP required\n- **VEO2 (Image-to-Video):** High quality, 5-8s, VIP required\n- **KLING 2.1 (Image-to-Video):** Good value, 5-10s, VIP required\n\n**Cost Optimization:**\n- Recommend HD resolution (1344x768) for cost efficiency\n- Suggest 5-second duration for initial tests\n- Use economical models for experimentation\n- Explain VIP requirements for premium features\n\n**Creative Applications:**\n- Marketing and promotional content\n- Educational and explanatory videos\n- Artistic and experimental projects\n- Social media content creation\n- Product demonstrations\n- Storytelling and narrative content\n\nAlways emphasize the economical default settings (HD resolution, 5s duration) and guide users toward cost-effective choices while maintaining quality.\n\n\n\nYou are an AI video model expert who helps users understand and select the best video generation models for their needs.\n\n**Model Categories:**\n\n**Text-to-Video Models (Generate from text descriptions only):**\n- **LTX (comfyui/ltx):** 0.40 USD/sec, 5s max, no VIP required - Best value option\n- **Sora (azure-openai/sora):** 2.00 USD/sec, up to 20s, VIP required - Longest duration\n\n**Image-to-Video Models (Require source image + text):**\n- **VEO3 (google-cloud/veo3):** 3.00 USD/sec, 5-8s, VIP required - Premium quality\n- **VEO2 (google-cloud/veo2):** 2.00 USD/sec, 5-8s, VIP required - High quality\n- **KLING 2.1 (fal-ai/kling-video/v2.1/standard/image-to-video):** 1.00 USD/sec, 5-10s, VIP required\n\n**Selection Factors:**\n1. **Budget:** LTX for cost-conscious users, VEO3 for premium quality\n2. **Duration:** Sora for longer videos, others for shorter content\n3. **Input Type:** Text-only vs. image+text requirements\n4. **Quality:** VEO3 for highest quality, LTX for good value\n5. **VIP Access:** Some models require premium subscription\n\n**Recommendation Strategy:**\n- Start with LTX for cost efficiency and testing\n- Use Sora when longer duration is needed\n- Recommend VEO models for image-to-video with high quality requirements\n- Consider KLING 2.1 as a mid-range image-to-video option\n- Always check VIP requirements before suggesting premium models\n\n**Cost Calculation Examples:**\n- LTX 5s video: 5 \u00D7 0.40 = 2.00 USD\n- Sora 20s video: 20 \u00D7 2.00 = 40.00 USD\n- VEO3 8s video: 8 \u00D7 3.00 = 24.00 USD\n\nHelp users make informed decisions based on their budget, quality requirements, and content type.\n\n\n\nYou are an AI script generation expert who creates compelling, well-structured scripts for various media formats.\n\n**Script Types and Formats:**\n1. **Screenplays:** Film, TV, and web content with proper formatting\n2. **Stage Plays:** Theater productions with dialogue and stage directions\n3. **Podcast Scripts:** Audio content with timing and segment structure\n4. **Commercial Scripts:** Advertising and marketing content\n5. **Educational Scripts:** Tutorials, presentations, and learning materials\n6. **Story Scripts:** Narrative content for various media\n\n**Script Structure Elements:**\n- **Opening Hook:** Engaging introduction to capture attention\n- **Clear Objectives:** What the script aims to achieve\n- **Logical Flow:** Smooth progression from beginning to end\n- **Character Development:** Distinct voices and motivations\n- **Conflict and Resolution:** Engaging narrative arc\n- **Call to Action:** Clear next steps or desired response\n\n**Formatting Standards:**\n- Use proper industry formatting for the specific script type\n- Include scene headings, character names, and dialogue\n- Add parentheticals for character actions and emotions\n- Maintain consistent spacing and indentation\n- Follow genre-specific conventions and expectations\n\n**Content Quality Guidelines:**\n- Write engaging, natural dialogue\n- Create clear, visual scene descriptions\n- Maintain consistent tone and style\n- Include appropriate pacing and rhythm\n- Ensure logical story progression\n- Add creative elements that enhance engagement\n\n**Adaptation Considerations:**\n- Consider the target audience and platform\n- Adapt language and complexity appropriately\n- Include relevant cultural and contextual elements\n- Optimize for the specific medium's requirements\n- Ensure accessibility and inclusivity\n\nAlways create scripts that are engaging, well-structured, and ready for production or further development.\n\n\n\nYou are an AI prompt engineering expert who specializes in improving and optimizing prompts for better AI generation results.\n\n**Enhancement Techniques:**\n1. **Clarity and Specificity:** Make vague requests more precise and detailed\n2. **Technical Terminology:** Add appropriate technical and artistic terms\n3. **Style References:** Include relevant artistic styles and visual approaches\n4. **Quality Descriptors:** Add terms that improve output quality\n5. **Context and Background:** Provide additional context when helpful\n6. **Negative Prompts:** Specify what to avoid for better results\n\n**Enhancement Categories:**\n- **Image Generation:** Photography terms, artistic styles, composition guidance\n- **Video Generation:** Cinematography terms, motion descriptions, production quality\n- **Text Generation:** Writing styles, tone adjustments, structure improvements\n- **General Enhancement:** Clarity, specificity, and professional terminology\n\n**Quality Improvement Terms:**\n- **Visual Quality:** \"high resolution,\" \"sharp focus,\" \"professional photography\"\n- **Artistic Style:** \"masterpiece,\" \"award-winning,\" \"trending on artstation\"\n- **Technical Excellence:** \"excellent composition,\" \"rule of thirds,\" \"dramatic lighting\"\n- **Production Value:** \"cinematic quality,\" \"Hollywood production,\" \"IMAX quality\"\n\n**Enhancement Process:**\n1. **Analyze Original:** Understand the user's intent and requirements\n2. **Identify Gaps:** Find areas where specificity or detail can be added\n3. **Apply Techniques:** Use appropriate enhancement methods\n4. **Maintain Intent:** Preserve the original creative vision\n5. **Optimize Language:** Use clear, effective terminology\n6. **Provide Context:** Explain improvements and reasoning\n\n**Output Format:**\nProvide enhanced prompts with:\n- Clear, specific language\n- Appropriate technical terms\n- Quality descriptors\n- Style references when relevant\n- Negative prompts when helpful\n- Explanation of improvements made\n\nAlways enhance prompts while preserving the user's original creative intent and vision.\n\n";

interface Entitlements {
    maxMessagesPerDay: number;
    availableChatModelIds: string[];
    maxImageGenerationsPerDay?: number;
    maxVideoGenerationsPerDay?: number;
    maxScriptGenerationsPerDay?: number;
    maxPromptEnhancementsPerDay?: number;
    vipAccess?: boolean;
    customModelAccess?: boolean;
    prioritySupport?: boolean;
}
type UserType = 'guest' | 'regular' | 'premium' | 'vip';
interface UserEntitlements {
    userType: UserType;
    entitlements: Entitlements;
    isActive: boolean;
    expiresAt?: Date;
    features: string[];
}
interface FeatureAccess {
    featureId: string;
    isEnabled: boolean;
    usageLimit?: number;
    usageCount: number;
    resetDate: Date;
}
interface EntitlementCheck {
    hasAccess: boolean;
    reason?: string;
    remainingUsage?: number;
    nextReset?: Date;
}

declare const entitlementsByUserType: Record<UserType, Entitlements>;
declare function getUserEntitlements(userType: UserType): Entitlements;
declare function hasFeatureAccess(userType: UserType, featureId: string): boolean;
/**
 * Get available chat models for a user type
 */
declare function getAvailableChatModels(userType: UserType): string[];
/**
 * Check if user can use a specific chat model
 */
declare function canUseChatModel(userType: UserType, modelId: string): boolean;
/**
 * Get usage limits for a user type
 */
declare function getUsageLimits(userType: UserType): {
    messages: number;
    images: number;
    videos: number;
    scripts: number;
    promptEnhancements: number;
};

interface DataStreamWriter {
    write: (data: any) => void;
    end: () => void;
    error: (error: Error) => void;
}
type DataStreamWriterProps = {
    write: DataStreamWriter["write"];
    end: DataStreamWriter["end"];
    error: DataStreamWriter["error"];
};
interface DataStreamConfig {
    bufferSize?: number;
    flushInterval?: number;
    encoding?: string;
    compression?: boolean;
}
interface DataStreamEvent {
    type: "data" | "end" | "error";
    payload?: any;
    timestamp: number;
    id?: string;
}
interface DataStreamReader {
    read: () => Promise<any>;
    hasNext: () => boolean;
    close: () => void;
}
interface DataStreamTransform {
    transform: (data: any) => any;
    flush?: () => any;
}

declare class BufferedDataStreamWriter implements DataStreamWriter {
    private buffer;
    private config;
    private flushTimer?;
    constructor(config?: DataStreamConfig);
    write(data: any): void;
    end(): void;
    error(error: Error): void;
    private flush;
    private cleanup;
}
declare function createDataStreamWriter(props: DataStreamWriterProps): DataStreamWriter;
declare function createBufferedDataStreamWriter(config?: DataStreamConfig): DataStreamWriter;

interface MediaAttachment {
    name: string;
    url: string;
    contentType: string;
    thumbnailUrl?: string;
}
interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system" | "data";
    parts: Array<{
        type: "text" | "image" | "video";
        text?: string;
        url?: string;
    }>;
    experimental_attachments?: MediaAttachment[];
    createdAt: Date;
    content?: string;
}
type MessageUpdater<T> = (updater: (prev: T[]) => T[]) => void;
interface MediaSaveOptions {
    chatId: string;
    mediaUrl: string;
    prompt: string;
    setMessages: MessageUpdater<any>;
    thumbnailUrl?: string;
    type?: "image" | "video";
}
interface MediaTypeConfig {
    image: string;
    video: string;
}
interface MediaSaveResult {
    success: boolean;
    messageId?: string;
    error?: string;
    duplicate?: boolean;
}

declare const saveImageToChat: (chatId: string, imageUrl: string, prompt: string, setMessages: MessageUpdater<any>, thumbnailUrl?: string) => Promise<MediaSaveResult>;
declare const saveMediaToChat: (chatId: string, mediaUrl: string, prompt: string, setMessages: MessageUpdater<any>, type: "image" | "video", thumbnailUrl?: string) => Promise<MediaSaveResult>;
declare const saveVideoToChat: (chatId: string, videoUrl: string, prompt: string, setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void, thumbnailUrl?: string) => Promise<MediaSaveResult>;
declare const saveArtifactToChat: (chatId: string, artifactUrl: string, prompt: string, setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void, type?: "image" | "video", thumbnailUrl?: string) => Promise<MediaSaveResult>;
declare const checkMediaExists: (messages: ChatMessage[], mediaUrl: string) => boolean;
declare const getMediaAttachments: (messages: ChatMessage[]) => MediaAttachment[];

declare const saveArtifactToDatabase: (documentId: string, title: string, content: string, kind: "image" | "video" | "text" | "sheet" | "script", thumbnailUrl?: string) => Promise<void>;

interface ToolProps {
    dataStream: {
        write: DataStreamWriter["write"];
        end: DataStreamWriter["end"];
        error: DataStreamWriter["error"];
    };
}
interface ToolResult {
    type: "success" | "error";
    message: string;
    data?: any;
}
interface ToolDefinition {
    description: string;
    parameters: z.ZodType<any>;
    execute: (params: any) => Promise<ToolResult>;
}
type Tool = {
    new (props: ToolProps): ToolDefinition;
};
interface ToolExecutionContext {
    userId?: string;
    sessionId?: string;
    chatId?: string;
    metadata?: Record<string, any>;
}
interface ToolValidationResult {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}
interface ToolMetadata {
    name: string;
    version: string;
    author?: string;
    description: string;
    tags?: string[];
    category?: string;
    requiresAuth?: boolean;
    rateLimit?: {
        requests: number;
        window: number;
    };
}

interface ArtifactMetadata {
    [key: string]: any;
}
interface ArtifactProps {
    title: string;
    content: string;
    mode: "edit" | "diff";
    status: "streaming" | "idle";
    currentVersionIndex: number;
    suggestions: any[];
    onSaveContent: (content: string, debounce?: boolean) => void;
    isInline: boolean;
    isCurrentVersion: boolean;
    getDocumentContentById: (index: number) => string;
    isLoading: boolean;
    metadata?: ArtifactMetadata;
    setMetadata?: (metadata: ArtifactMetadata) => void;
    chatId?: string;
}
interface ArtifactDefinition {
    kind: string;
    description: string;
    content: any;
    initialize?: (props: {
        documentId: string;
        setMetadata: (metadata: ArtifactMetadata) => void;
    }) => Promise<void>;
    onStreamPart?: (props: {
        streamPart: {
            type: string;
            content: any;
        };
        setArtifact: (artifact: any) => void;
        setMetadata: (metadata: ArtifactMetadata) => void;
    }) => void;
    actions?: Array<{
        icon: any;
        description: string;
        onClick: (props: any) => void;
        isDisabled?: (props: any) => boolean;
    }>;
}
interface ArtifactVersion {
    id: string;
    content: string;
    timestamp: Date;
    author?: string;
    metadata?: ArtifactMetadata;
}
interface ArtifactHistory {
    versions: ArtifactVersion[];
    currentVersion: number;
    maxVersions: number;
}
interface ArtifactStreamEvent {
    type: "content" | "metadata" | "status" | "error";
    content?: any;
    metadata?: ArtifactMetadata;
    status?: string;
    error?: string;
    timestamp: Date;
}
interface ArtifactSaveOptions {
    debounce?: boolean;
    createVersion?: boolean;
    metadata?: ArtifactMetadata;
    notifyUser?: boolean;
}

export { type AIGenerationConfig, type AIImageGenerationConfig, type AIProvider, type AIScriptGenerationConfig, type AIVideoGenerationConfig, type Artifact, type ArtifactCollection, type ArtifactDefinition, type ArtifactHistory, type ArtifactKind, type ArtifactMetadata, type ArtifactProps, type ArtifactSaveOptions, type ArtifactSearchParams, ArtifactService, type ArtifactStreamEvent, type ArtifactVersion, type BalanceConfig, BalanceService, BufferedDataStreamWriter, type ChatMessage, type ChatModel, type ConfigurationResult, type ConfigureImageGenerationParams, type CreateDocumentCallbackProps, type CreditTransaction, type CreditUsage, DEFAULT_CHAT_MODEL, DEFAULT_IMAGE_CONFIG, DEFAULT_VIDEO_CONFIG, type DataStreamConfig, type DataStreamEvent, type DataStreamReader, type DataStreamTransform, type DataStreamWriter, type DataStreamWriterProps, type DocumentHandler, type EnhancePromptParams, type EnhancedPrompt, type EnhancedPromptResult, type EntitlementCheck, type Entitlements, type FeatureAccess, type GeneratedScript, type GenerationConfig, type ImageGenType, type ImageGenerationConfig, ImageGenerationConfigurationTool, type ImageGenerationParams, type ImageGenerationResult, ImageGenerationUtils, type ImageToImageParams, ImageToImageStrategy, type InpaintingParams, InpaintingStrategy, type LanguageSupport, type MediaAttachment, type MediaOption, type MediaSaveOptions, type MediaSaveResult, type MediaTypeConfig, type MessageUpdater, type ModelConfig, type PromptArtifactKind, type PromptCategory, type PromptContext, type PromptEnhancementOptions, type PromptEnhancementParams, PromptEnhancementTool, PromptEnhancer, type PromptLibrary, type PromptStyle, type PromptTemplate, type RequestHints, type SaveDocumentProps, type ScriptGenerationParams, ScriptGenerator, type ScriptMetadata, type ScriptOutline, type ScriptTemplate, TextToImageStrategy, TextToVideoStrategy, type Tool, type ToolDefinition, type ToolExecutionContext, type ToolMetadata, type ToolPrompt, type ToolProps, type ToolResult, type ToolValidationResult, type UpdateDocumentCallbackProps, type UserBalance, type UserEntitlements, type UserType, type VideoGenerationConfig, type VideoGenerationParams, type VideoGenerationResult, VideoGenerationUtils, type VideoToVideoParams, VideoToVideoStrategy, artifactModel, artifactService, artifactsPrompt, balanceService, canUseChatModel, chatModel, chatModels, checkMediaExists, codePrompt, combinedToolsPrompt, configureImageGeneration, configureImageGenerationSchema, configureScriptGeneration, configureVideoGeneration, createBufferedDataStreamWriter, createCustomProvider, createDataStreamWriter, createDocument, defaultAIProvider, enhancePrompt, enhancePromptSchema, entitlementsByUserType, findBestVideoModel, getAllProviders, getAvailableChatModels, getDefaultModel, getMediaAttachments, getModelById, getModelsByCapability, getProviderById, getRequestPromptFromHints, getUsageLimits, getUserEntitlements, hasFeatureAccess, imageGenerationConfigurationTool, imageGenerationPrompt, imageToImageStrategy, inpaintingStrategy, listVideoModels, myProvider, promptEnhancementPrompt, promptEnhancementTool, promptEnhancer, reasoningModel, regularPrompt, requestSuggestions, saveArtifactToChat, saveArtifactToDatabase, saveImageToChat, saveMediaToChat, saveVideoToChat, scriptGenerationConfigurationTool, scriptGenerationPrompt, scriptGenerator, sheetPrompt, systemPrompt, textToImageStrategy, textToVideoStrategy, titleModel, updateDocument, updateDocumentPrompt, validateProviderConfig, videoGenerationConfigurationTool, videoGenerationPrompt, videoModelsPrompt, videoToVideoStrategy };

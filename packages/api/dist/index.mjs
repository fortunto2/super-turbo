import axios from 'axios';
import { API_ENDPOINTS } from '@turbo-super/core';

// src/superduperai/client.ts
var SuperDuperAIClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.SUPERDUPERAI_BASE_URL,
      timeout: 3e4,
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var superDuperAIClient = new SuperDuperAIClient();

// src/superduperai/types.ts
var GenerationType = /* @__PURE__ */ ((GenerationType2) => {
  GenerationType2["TEXT_TO_IMAGE"] = "text_to_image";
  GenerationType2["IMAGE_TO_IMAGE"] = "image_to_image";
  GenerationType2["TEXT_TO_VIDEO"] = "text_to_video";
  GenerationType2["IMAGE_TO_VIDEO"] = "image_to_video";
  GenerationType2["VIDEO_TO_VIDEO"] = "video_to_video";
  return GenerationType2;
})(GenerationType || {});
var ListOrder = /* @__PURE__ */ ((ListOrder2) => {
  ListOrder2["ASC"] = "asc";
  ListOrder2["DESC"] = "desc";
  return ListOrder2;
})(ListOrder || {});

// src/superduperai/endpoints.ts
var ENDPOINTS = {
  // Base endpoints
  BASE: "/api",
  // Generation endpoints
  GENERATE_IMAGE: "/api/generate/image",
  GENERATE_VIDEO: "/api/generate/video",
  GENERATE_SCRIPT: "/api/generate/script",
  // Configuration endpoints
  CONFIG_MODELS: "/api/config/models",
  CONFIG_SUPERDUPERAI: "/api/config/superduperai",
  CONFIG_GENERATION: "/api/config/generation",
  // File endpoints
  FILE_UPLOAD: "/api/files/upload",
  FILE_DOWNLOAD: "/api/file",
  // Project endpoints
  PROJECT_CREATE: "/api/project",
  PROJECT_VIDEO: "/api/project/video",
  // User endpoints
  USER_BALANCE: "/api/user/balance",
  USER_HISTORY: "/api/history",
  // Enhancement endpoints
  ENHANCE_PROMPT: "/api/enhance-prompt",
  // Event endpoints
  EVENTS_FILE: "/api/events/file",
  // WebSocket endpoints
  WEBSOCKET_BASE: "wss://ws.superduperai.co",
  WEBSOCKET_CHAT: "wss://ws.superduperai.co/chat",
  WEBSOCKET_GENERATION: "wss://ws.superduperai.co/generation"
};
var API_ROUTES = {
  // Next.js API routes
  NEXT: {
    GENERATE_IMAGE: "/api/generate/image",
    GENERATE_VIDEO: "/api/generate/video",
    GENERATE_SCRIPT: "/api/generate/script",
    FILE: (id) => `/api/file/${id}`,
    FILE_UPLOAD: "/api/file/upload",
    PROJECT: (id) => `/api/project/${id}`,
    PROJECT_VIDEO: "/api/project/video",
    ENHANCE_PROMPT: "/api/enhance-prompt",
    MODELS: "/api/config/models",
    SUPERDUPERAI: "/api/config/superduperai",
    EVENTS_FILE: (fileId) => `/api/events/file.${fileId}`
  }
};

// src/superduperai/config.ts
var modelCache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 60 * 60 * 1e3;
function validateBearerToken(token) {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  const tokenRegex = /^[a-zA-Z0-9_-]{32,}$/;
  if (!tokenRegex.test(cleanToken)) {
    console.warn("Token validation failed: Invalid format");
    return false;
  }
  return true;
}
function getSuperduperAIConfig() {
  if (typeof window === "undefined") {
    const url = "https://dev-editor.superduperai.co";
    url.replace("https://", "wss://").replace("http://", "ws://");
    {
      throw new Error("SUPERDUPERAI_TOKEN environment variable is required");
    }
  }
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  return {
    url: currentOrigin,
    // Use current origin for proxy paths
    token: "",
    // Never expose tokens to client
    wsURL: ""
    // Deprecated
  };
}
async function getClientSuperduperAIConfig() {
  try {
    const response = await fetch("/api/config/superduperai");
    if (!response.ok) {
      throw new Error("Failed to get SuperDuperAI config");
    }
    const data = await response.json();
    return {
      url: data.url,
      token: "",
      // Token is handled server-side
      wsURL: data.wsURL
    };
  } catch (error) {
    console.error("Failed to get client config:", error);
    return getSuperduperAIConfig();
  }
}
async function getCachedModels(cacheKey, fetchFunction) {
  const now = Date.now();
  const cached = modelCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  try {
    const data = await fetchFunction();
    modelCache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${cacheKey}:`, error);
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}
function clearModelCache() {
  modelCache.clear();
}
function getCacheStats() {
  const now = Date.now();
  const stats = {
    totalEntries: modelCache.size,
    validEntries: 0,
    expiredEntries: 0,
    totalSize: 0
  };
  for (const [key, value] of modelCache.entries()) {
    if (now - value.timestamp < CACHE_DURATION) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
    stats.totalSize += JSON.stringify(value.data).length;
  }
  return stats;
}

// src/superduperai/lib/image-generation/strategies/text-to-image.ts
var TextToImageStrategy = class {
  constructor() {
    this.type = "text-to-image";
    this.requiresSourceImage = false;
    this.requiresPrompt = true;
  }
  validate(params) {
    if (!params.prompt?.trim()) {
      return {
        valid: false,
        error: "Prompt is required for text-to-image generation"
      };
    }
    return { valid: true };
  }
  async generatePayload(params) {
    const modelName = params.model?.name || "fal-ai/flux-dev";
    const isGPTImage = String(modelName).includes("gpt-image-1");
    if (isGPTImage) {
      return {
        config: {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || "",
          width: params.resolution?.width || 1024,
          height: params.resolution?.height || 1024,
          seed: params.seed || Math.floor(Math.random() * 1e12),
          generation_config_name: modelName
        }
      };
    }
    return {
      config: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.resolution?.width || 512,
        height: params.resolution?.height || 512,
        steps: 30,
        shot_size: params.shotSize?.id || null,
        seed: params.seed || Math.floor(Math.random() * 1e12),
        generation_config_name: modelName,
        // batch_size removed: only single image generation is supported
        style_name: params.style?.id || null,
        references: [],
        entity_ids: []
      }
    };
  }
};

// src/superduperai/lib/image-generation/strategies/image-to-image.ts
var ImageToImageStrategy = class {
  constructor() {
    this.type = "image-to-image";
    this.requiresSourceImage = true;
    this.requiresPrompt = true;
  }
  validate(params) {
    if (!params.file && !params.sourceImageId && !params.sourceImageUrl) {
      return {
        valid: false,
        error: "Source image is required for image-to-image generation"
      };
    }
    if (!params.prompt?.trim()) {
      return {
        valid: false,
        error: "Prompt is required for image-to-image generation"
      };
    }
    return { valid: true };
  }
  async handleImageUpload(params, config) {
    console.log("\u{1F50D} handleImageUpload called with:", {
      hasFile: !!params.file,
      fileType: params.file?.type,
      fileSize: params.file?.size,
      uploadUrl: `${config.url}/api/v1/file/upload`
    });
    if (!params.file) {
      console.log("\u274C No file provided for upload");
      return {
        error: "No file provided for upload",
        method: "upload"
      };
    }
    try {
      const formData = new FormData();
      formData.append("payload", params.file);
      formData.append("type", "image");
      console.log(
        "\u{1F4E4} Sending upload request to:",
        `${config.url}/api/v1/file/upload`
      );
      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0"
        },
        body: formData
      });
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `File upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }
      const uploadResult = await uploadResponse.json();
      console.log("uploadResult", uploadResult);
      return {
        imageId: uploadResult?.id,
        imageUrl: uploadResult?.url || void 0,
        method: "upload"
      };
    } catch (error) {
      console.error("Error uploading file", error);
      return {
        error: "Image upload failed",
        method: "upload"
      };
    }
  }
  async generatePayload(params, config) {
    const modelName = params.model?.name || "fal-ai/flux-dev";
    const isGPTImage = String(modelName).includes("gpt-image-1");
    const imageId = params.sourceImageId;
    const sourceUrl = params.sourceImageUrl;
    if (isGPTImage) {
      return {
        config: {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || "",
          width: params.resolution?.width || 1920,
          height: params.resolution?.height || 1088,
          seed: params.seed || Math.floor(Math.random() * 1e12),
          generation_config_name: modelName,
          references: imageId ? [
            {
              type: "source",
              reference_id: imageId,
              ...sourceUrl ? { reference_url: sourceUrl } : {}
            }
          ] : [],
          entity_ids: []
        },
        ...imageId ? { file_ids: [imageId] } : {}
      };
    }
    const requestedSteps = params?.steps;
    const payload = {
      config: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.resolution?.width || 1920,
        height: params.resolution?.height || 1088,
        steps: typeof requestedSteps === "number" ? requestedSteps : 20,
        shot_size: null,
        seed: params.seed || Math.floor(Math.random() * 1e12),
        generation_config_name: modelName,
        style_name: null,
        references: imageId ? [
          {
            type: "source",
            reference_id: imageId,
            ...sourceUrl ? { reference_url: sourceUrl } : {}
          }
        ] : [],
        entity_ids: []
      },
      ...imageId ? { file_ids: [imageId] } : {}
    };
    console.log("\u{1F50D} ImageToImageStrategy: generated payload:", {
      modelName,
      imageId,
      sourceUrl,
      resolution: params.resolution,
      payload
    });
    return payload;
  }
};

// src/superduperai/lib/image-generation/strategy.factory.ts
var ImageGenerationStrategyFactory = class {
  constructor() {
    this.strategies = /* @__PURE__ */ new Map();
    this.registerStrategy(new TextToImageStrategy());
    this.registerStrategy(new ImageToImageStrategy());
  }
  registerStrategy(strategy) {
    this.strategies.set(strategy.type, strategy);
  }
  getStrategy(type) {
    return this.strategies.get(type) || null;
  }
  getAllStrategies() {
    return Array.from(this.strategies.values());
  }
  getSupportedTypes() {
    return Array.from(this.strategies.keys());
  }
};

// src/superduperai/lib/image-generation/generate.ts
async function generateImageWithStrategy(generationType, params, config) {
  console.log("\u{1F527} configureImageGeneration called with:", params);
  const factory = new ImageGenerationStrategyFactory();
  const strategy = factory.getStrategy(generationType);
  if (!strategy) {
    throw new Error(`Unsupported generation type: ${generationType}`);
  }
  let response;
  let result;
  try {
    const payload = await strategy.generatePayload(params, config);
    const endpoint = "/api/v1/file/generate-image";
    const url = `${config.url}${endpoint}`;
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText} - ${errorText}`
      };
    }
    result = await response.json();
    console.log("result", result);
    const fileId = result[0].id || result[0].file_id;
    if (!fileId) {
      return {
        success: false,
        error: "No file ID returned from API"
      };
    }
    return {
      success: true,
      projectId: fileId,
      requestId: fileId,
      fileId,
      message: `${strategy.type} generation started! FileId: ${fileId}`,
      tasks: result.tasks || []
    };
  } catch (error) {
    let errorMessage = error.message || `Unknown ${strategy.type} generation error`;
    return {
      success: false,
      error: errorMessage
    };
  }
}

// src/superduperai/lib/video-generation/strategies/image-to-video.ts
function snakeCase(str) {
  if (!str) return void 0;
  return str.trim().replace(/\s+/g, "_").toLowerCase();
}
function getStringValue(value) {
  if (!value) return void 0;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.id) return value.id;
  if (typeof value === "object" && value.label) return value.label;
  return void 0;
}
function parseResolution(resolution) {
  if (typeof resolution === "string") {
    if (resolution.includes("x")) {
      const [width, height] = resolution.split("x").map(Number);
      return { width, height, aspectRatio: `${width}:${height}` };
    } else if (resolution.includes(":")) {
      const [width, height] = resolution.split(":").map(Number);
      return { width, height, aspectRatio: resolution };
    }
  }
  if (resolution && typeof resolution === "object") {
    const width = resolution.width || 1280;
    const height = resolution.height || 720;
    const aspectRatio = resolution.aspectRatio || "16:9";
    return { width, height, aspectRatio };
  }
  return { width: 1280, height: 720, aspectRatio: "16:9" };
}
var ImageToVideoStrategy = class {
  constructor() {
    this.type = "image-to-video";
    this.requiresSourceImage = true;
    this.requiresPrompt = false;
  }
  // Animation description is optional
  validate(params) {
    if (!params.file) {
      return {
        valid: false,
        error: "Source image is required for image-to-video generation"
      };
    }
    return { valid: true };
  }
  /**
   * Handle image upload to SuperDuperAI
   */
  async handleImageUpload(params, config) {
    console.log("\u{1F50D} handleImageUpload called with:", {
      hasFile: !!params.file,
      fileType: params.file?.type,
      fileSize: params.file?.size,
      uploadUrl: `${config.url}/api/v1/file/upload`
    });
    if (!params.file) {
      console.log("\u274C No file provided for upload");
      return {
        error: "No file provided for upload",
        method: "upload"
      };
    }
    try {
      const formData = new FormData();
      formData.append("payload", params.file);
      formData.append("type", "image");
      console.log(
        "\u{1F4E4} Sending upload request to:",
        `${config.url}/api/v1/file/upload`
      );
      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0"
        },
        body: formData
      });
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `File upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }
      const uploadResult = await uploadResponse.json();
      console.log("uploadResult", uploadResult);
      return {
        imageId: uploadResult?.id,
        imageUrl: uploadResult?.url || void 0,
        method: "upload"
      };
    } catch (error) {
      console.error("Error uploading file", error);
      return {
        error: "Image upload failed",
        method: "upload"
      };
    }
  }
  async generatePayload(params, config) {
    let imageId;
    console.log("\u{1F50D} ImageToVideoStrategy.generatePayload called with:", {
      hasConfig: !!config,
      hasFile: !!params.file,
      fileType: params.file?.type,
      fileSize: params.file?.size
    });
    if (config) {
      console.log("\u{1F4E4} Starting image upload...");
      const uploadResult = await this.handleImageUpload(params, config);
      console.log("\u{1F4E4} Image upload result:", uploadResult);
      imageId = uploadResult.imageId;
    } else {
      console.log("\u26A0\uFE0F No config provided, skipping image upload");
    }
    const { width, height, aspectRatio } = parseResolution(params.resolution);
    const modelName = typeof params.model === "string" ? params.model : params.model?.name || "azure-openai/sora";
    const payload = {
      config: {
        prompt: params.prompt || "animate this image naturally",
        // Default for image-to-video
        generation_config_name: modelName,
        duration: params.duration,
        aspect_ratio: aspectRatio || "16:9",
        seed: params.seed || Math.floor(Math.random() * 1e12),
        negative_prompt: params.negativePrompt || "",
        width,
        height,
        frame_rate: params.frameRate,
        shot_size: snakeCase(getStringValue(params.shotSize)),
        // Extract string from object/string
        style_name: snakeCase(getStringValue(params.style)),
        // Extract string from object/string
        references: imageId ? [
          {
            type: "source",
            reference_id: imageId
          }
        ] : []
      }
    };
    console.log("\u{1F4E6} Final payload references:", {
      imageId,
      references: payload.config.references,
      referencesLength: payload.config.references.length
    });
    return payload;
  }
};

// src/superduperai/lib/video-generation/strategies/text-to-video.ts
function snakeCase2(str) {
  if (!str) return void 0;
  return str.trim().replace(/\s+/g, "_").toLowerCase();
}
function getStringValue2(value) {
  if (!value) return void 0;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.id) return value.id;
  if (typeof value === "object" && value.label) return value.label;
  return void 0;
}
function parseResolution2(resolution) {
  if (typeof resolution === "string") {
    if (resolution.includes("x")) {
      const [width, height] = resolution.split("x").map(Number);
      return { width, height, aspectRatio: `${width}:${height}` };
    } else if (resolution.includes(":")) {
      const [width, height] = resolution.split(":").map(Number);
      return { width, height, aspectRatio: resolution };
    }
  }
  if (resolution && typeof resolution === "object") {
    const width = resolution.width || 1280;
    const height = resolution.height || 720;
    const aspectRatio = resolution.aspectRatio || "16:9";
    return { width, height, aspectRatio };
  }
  return { width: 1280, height: 720, aspectRatio: "16:9" };
}
var TextToVideoStrategy = class {
  constructor() {
    this.type = "text-to-video";
    this.requiresSourceImage = false;
    this.requiresPrompt = true;
  }
  validate(params) {
    if (!params.prompt?.trim()) {
      return {
        valid: false,
        error: "Prompt is required for text-to-video generation"
      };
    }
    return { valid: true };
  }
  generatePayload(params, config) {
    const { width, height, aspectRatio } = parseResolution2(params.resolution);
    const modelName = typeof params.model === "string" ? params.model : params.model?.name || "azure-openai/sora";
    const payload = {
      config: {
        prompt: params.prompt,
        generation_config_name: modelName,
        duration: params.duration,
        aspect_ratio: aspectRatio || "16:9",
        seed: params.seed || Math.floor(Math.random() * 1e12),
        negative_prompt: params.negativePrompt || "",
        width,
        height,
        frame_rate: params.frameRate,
        shot_size: snakeCase2(getStringValue2(params.shotSize)),
        // Extract string from object/string
        style_name: snakeCase2(getStringValue2(params.style))
        // Extract string from object/string
      }
    };
    return payload;
  }
};

// src/superduperai/lib/video-generation/strategy.factory.ts
var VideoGenerationStrategyFactory = class {
  constructor() {
    this.strategies = /* @__PURE__ */ new Map();
    this.registerStrategy(new TextToVideoStrategy());
    this.registerStrategy(new ImageToVideoStrategy());
  }
  registerStrategy(strategy) {
    this.strategies.set(strategy.type, strategy);
  }
  getStrategy(type) {
    return this.strategies.get(type) || null;
  }
  getAllStrategies() {
    return Array.from(this.strategies.values());
  }
  getSupportedTypes() {
    return Array.from(this.strategies.keys());
  }
};

// src/superduperai/lib/video-generation/generate.ts
async function generateVideoWithStrategy(generationType, params, config) {
  const factory = new VideoGenerationStrategyFactory();
  const strategy = factory.getStrategy(generationType);
  if (!strategy) {
    return {
      success: false,
      error: `Unsupported generation type: ${generationType}. Supported types: ${factory.getSupportedTypes().join(", ")}`
    };
  }
  const validation = strategy.validate(params);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }
  try {
    const payload = await strategy.generatePayload(params, config);
    const endpoint = "/api/v1/file/generate-video";
    const url = `${config.url}${endpoint}`;
    console.log(
      "\u{1F3AC} Sending with JSON payload:",
      JSON.stringify(payload, null, 2)
    );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `\u274C ${strategy.type} API Error (${response.status}):`,
        errorText
      );
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText} - ${errorText}`
      };
    }
    const result = await response.json();
    console.log(`\u{1F4E8} ${strategy.type} API Response:`, result);
    const fileId = result.id || result.data?.[0]?.value?.file_id || result.data?.[0]?.id || result.fileId;
    if (!fileId) {
      console.error("\u274C No fileId found in response");
      return {
        success: false,
        error: "No file ID returned from API"
      };
    }
    console.log(`\u{1F3AC} ${strategy.type} generation started - FileId: ${fileId}`);
    return {
      success: true,
      projectId: fileId,
      requestId: fileId,
      fileId,
      message: `${strategy.type} generation started! FileId: ${fileId}`
    };
  } catch (error) {
    console.error(`\u274C ${strategy.type} generation error:`, error);
    let errorMessage = error.message || `Unknown ${strategy.type} generation error`;
    return {
      success: false,
      error: errorMessage
    };
  }
}

// src/superduperai/lib/pricing/tools-pricing.ts
var TOOLS_PRICING = {
  // Image Generation
  "image-generation": {
    "text-to-image": {
      id: "text-to-image",
      name: "Text to Image",
      description: "Generate image from text prompt",
      baseCost: 5,
      // 5 credits per image
      costMultipliers: {
        "standard-quality": 1,
        // Standard quality (default)
        "high-quality": 1.5,
        // +50% for high quality
        "ultra-quality": 2
        // +100% for ultra quality
      }
    },
    "image-to-image": {
      id: "image-to-image",
      name: "Image to Image",
      description: "Transform existing image",
      baseCost: 7,
      // 7 credits per transformation
      costMultipliers: {
        "standard-quality": 1,
        "high-quality": 1.5,
        "ultra-quality": 2
      }
    }
  },
  // Video Generation
  "video-generation": {
    "text-to-video": {
      id: "text-to-video",
      name: "Text to Video",
      description: "Generate video from text prompt",
      baseCost: 7.5,
      // 7.5 credits for 5 seconds
      costMultipliers: {
        "duration-5s": 1,
        // 7.5 credits for 5 seconds
        "duration-10s": 2,
        // 15 credits for 10 seconds
        "duration-15s": 3,
        // 22.5 credits for 15 seconds
        "duration-30s": 6,
        // 45 credits for 30 seconds
        "hd-quality": 1,
        // HD is default, no extra cost
        "4k-quality": 2
        // +100% for 4K
      }
    },
    "image-to-video": {
      id: "image-to-video",
      name: "Image to Video",
      description: "Convert image to video",
      baseCost: 11.25,
      // 11.25 credits for 5 seconds (50% more than text-to-video)
      costMultipliers: {
        "duration-5s": 1,
        // 11.25 credits for 5 seconds
        "duration-10s": 2,
        // 22.5 credits for 10 seconds
        "duration-15s": 3,
        // 33.75 credits for 15 seconds
        "duration-30s": 6,
        // 67.5 credits for 30 seconds
        "hd-quality": 1,
        // HD is default, no extra cost
        "4k-quality": 2
        // +100% for 4K
      }
    }
  },
  // Script Generation
  "script-generation": {
    "basic-script": {
      id: "basic-script",
      name: "Script Generation",
      description: "Generate script or text content",
      baseCost: 1,
      // 1 credit per script
      costMultipliers: {
        "long-form": 2
        // +100% for long scripts (>1000 words)
      }
    }
  },
  // Prompt Enhancement
  "prompt-enhancement": {
    "basic-enhancement": {
      id: "basic-enhancement",
      name: "Prompt Enhancement",
      description: "Enhance and improve prompts",
      baseCost: 1
      // 1 credit per enhancement
    },
    "veo3-enhancement": {
      id: "veo3-enhancement",
      name: "VEO3 Prompt Enhancement",
      description: "Advanced prompt enhancement for VEO3",
      baseCost: 2
      // 2 credits per enhancement
    }
  }
};
var FREE_BALANCE_BY_USER_TYPE = {
  guest: 50,
  // Guests get 50 credits
  regular: 100,
  // Regular users get 100 credits
  demo: 100
  // Demo users get 100 credits
};
function calculateOperationCost(toolCategory, operationType, multipliers = []) {
  const tool = TOOLS_PRICING[toolCategory];
  if (!tool) throw new Error(`Unknown tool category: ${toolCategory}`);
  const operation = tool[operationType];
  if (!operation)
    throw new Error(`Unknown operation: ${operationType} in ${toolCategory}`);
  let totalCost = operation.baseCost;
  if (operation.costMultipliers && multipliers.length > 0) {
    let multiplier = 1;
    for (const mult of multipliers) {
      if (operation.costMultipliers[mult]) {
        multiplier *= operation.costMultipliers[mult];
      }
    }
    totalCost = Math.ceil(totalCost * multiplier);
  }
  return totalCost;
}
function getToolOperations(toolCategory) {
  const tool = TOOLS_PRICING[toolCategory];
  if (!tool) return [];
  return Object.values(tool);
}
function getToolPricingDisplay(toolCategory, operationType) {
  const tool = TOOLS_PRICING[toolCategory];
  if (!tool) throw new Error(`Unknown tool category: ${toolCategory}`);
  const operation = tool[operationType];
  if (!operation) throw new Error(`Unknown operation: ${operationType}`);
  const result = {
    baseCost: operation.baseCost,
    description: operation.description
  };
  if (operation.costMultipliers) {
    const multipliers = {};
    for (const [key, value] of Object.entries(operation.costMultipliers)) {
      const percentage = Math.round((value - 1) * 100);
      multipliers[key] = percentage > 0 ? `+${percentage}%` : `${percentage}%`;
    }
    return { ...result, multipliers };
  }
  return result;
}
var PRICING_EXAMPLES = {
  "Basic image generation": calculateOperationCost(
    "image-generation",
    "text-to-image"
  ),
  "High-quality image": calculateOperationCost(
    "image-generation",
    "text-to-image",
    ["high-quality"]
  ),
  "Short video (5s)": calculateOperationCost(
    "video-generation",
    "text-to-video",
    ["duration-5s"]
  ),
  "HD video (10s)": calculateOperationCost(
    "video-generation",
    "text-to-video",
    ["duration-10s", "hd-quality"]
  ),
  "Script generation": calculateOperationCost(
    "script-generation",
    "basic-script"
  ),
  "Prompt enhancement": calculateOperationCost(
    "prompt-enhancement",
    "basic-enhancement"
  )
};

// src/superduperai/lib/pricing/balance-utils.ts
function checkOperationBalance(currentBalance, toolCategory, operationType, multipliers = []) {
  const requiredBalance = calculateOperationCost(
    toolCategory,
    operationType,
    multipliers
  );
  const hasEnoughBalance = currentBalance >= requiredBalance;
  const shortfall = hasEnoughBalance ? 0 : requiredBalance - currentBalance;
  return {
    hasEnoughBalance,
    currentBalance,
    requiredBalance,
    shortfall
  };
}
function getOperationCost(toolCategory, operationType, multipliers = []) {
  return calculateOperationCost(toolCategory, operationType, multipliers);
}
function createBalanceTransaction(userId, operationType, operationCategory, balanceBefore, balanceAfter, metadata) {
  return {
    userId,
    operationType,
    operationCategory,
    amount: balanceAfter - balanceBefore,
    balanceBefore,
    balanceAfter,
    timestamp: /* @__PURE__ */ new Date(),
    metadata
  };
}
function getPricingInfo(toolCategory, operationType) {
  const tool = TOOLS_PRICING[toolCategory];
  if (!tool) return null;
  const operation = tool[operationType];
  if (!operation) return null;
  return {
    baseCost: operation.baseCost,
    name: operation.name,
    description: operation.description,
    multipliers: operation.costMultipliers
  };
}
var StripeClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.STRIPE_BASE_URL,
      timeout: 3e4,
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var stripeClient = new StripeClient();

// src/stripe/endpoints.ts
var STRIPE_ENDPOINTS = {
  // Customers
  CUSTOMERS: {
    CREATE: "/customers",
    GET: "/customers/:id",
    UPDATE: "/customers/:id",
    DELETE: "/customers/:id"
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    CREATE: "/subscriptions",
    GET: "/subscriptions/:id",
    UPDATE: "/subscriptions/:id",
    CANCEL: "/subscriptions/:id/cancel"
  },
  // Prices
  PRICES: {
    LIST: "/prices",
    GET: "/prices/:id"
  },
  // Checkout
  CHECKOUT: {
    SESSIONS: "/checkout/sessions",
    SESSION: "/checkout/sessions/:id"
  }
};
var UploadClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.UPLOAD_BASE_URL,
      timeout: 6e4,
      // Longer timeout for file uploads
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var uploadClient = new UploadClient();
var WebSocketClient = class {
  constructor(url = API_ENDPOINTS.WEBSOCKET_BASE_URL, options = {}) {
    this.url = url;
    this.options = options;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1e3;
  }
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);
        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          this.options.onOpen?.();
          resolve();
        };
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.options.onMessage?.(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
        this.socket.onclose = () => {
          this.options.onClose?.();
          this.attemptReconnect();
        };
        this.socket.onerror = (error) => {
          this.options.onError?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
};
var webSocketClient = new WebSocketClient();

export { API_ROUTES, ENDPOINTS, FREE_BALANCE_BY_USER_TYPE, GenerationType, ImageGenerationStrategyFactory, ImageToImageStrategy, ImageToVideoStrategy, ListOrder, PRICING_EXAMPLES, STRIPE_ENDPOINTS, StripeClient, SuperDuperAIClient, TOOLS_PRICING, TextToImageStrategy, TextToVideoStrategy, UploadClient, VideoGenerationStrategyFactory, WebSocketClient, calculateOperationCost, checkOperationBalance, clearModelCache, createBalanceTransaction, generateImageWithStrategy, generateVideoWithStrategy, getCacheStats, getCachedModels, getClientSuperduperAIConfig, getOperationCost, getPricingInfo, getSuperduperAIConfig, getToolOperations, getToolPricingDisplay, stripeClient, superDuperAIClient, uploadClient, validateBearerToken, webSocketClient };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map
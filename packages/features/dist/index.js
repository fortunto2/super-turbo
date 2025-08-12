'use strict';

var api = require('@turbo-super/api');
var zod = require('zod');

// src/image-generation/strategies/text-to-image.ts
var TextToImageStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl"
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/image",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Text-to-image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
  }
};
var textToImageStrategy = new TextToImageStrategy();
var ImageToImageStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        denoising_strength: params.denoisingStrength || 0.75
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/image-to-image",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Image-to-image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputImage) {
      throw new Error("Input image is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
    if (params.denoisingStrength && (params.denoisingStrength < 0 || params.denoisingStrength > 1)) {
      throw new Error("Denoising strength must be between 0 and 1");
    }
  }
};
var imageToImageStrategy = new ImageToImageStrategy();
var InpaintingStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        mask: params.mask,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        mask_blur: params.maskBlur || 4
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/inpainting",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Inpainting generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputImage) {
      throw new Error("Input image is required");
    }
    if (!params.mask) {
      throw new Error("Mask is required for inpainting");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
    if (params.maskBlur && (params.maskBlur < 0 || params.maskBlur > 64)) {
      throw new Error("Mask blur must be between 0 and 64");
    }
  }
};
var inpaintingStrategy = new InpaintingStrategy();

// src/image-generation/utils.ts
var DEFAULT_IMAGE_CONFIG = {
  defaultModel: "stable-diffusion-xl",
  maxSteps: 50,
  maxCfgScale: 20,
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 }
  ],
  defaultStrength: 0.75
};
var ImageGenerationUtils = class {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width, height) {
    return DEFAULT_IMAGE_CONFIG.supportedResolutions.some(
      (res) => res.width === width && res.height === height
    );
  }
  /**
   * Get closest supported resolution
   */
  static getClosestResolution(width, height) {
    let closest = DEFAULT_IMAGE_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;
    for (const res of DEFAULT_IMAGE_CONFIG.supportedResolutions) {
      const distance = Math.sqrt(
        Math.pow(res.width - width, 2) + Math.pow(res.height - height, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = res;
      }
    }
    return closest;
  }
  /**
   * Calculate aspect ratio
   */
  static getAspectRatio(width, height) {
    return width / height;
  }
  /**
   * Check if image is square
   */
  static isSquare(width, height) {
    return width === height;
  }
  /**
   * Check if image is portrait
   */
  static isPortrait(width, height) {
    return height > width;
  }
  /**
   * Check if image is landscape
   */
  static isLandscape(width, height) {
    return width > height;
  }
  /**
   * Generate a random seed
   */
  static generateRandomSeed() {
    return Math.floor(Math.random() * 2147483647);
  }
  /**
   * Validate prompt length
   */
  static validatePromptLength(prompt, maxLength = 1e3) {
    return prompt.length <= maxLength;
  }
  /**
   * Sanitize prompt text
   */
  static sanitizePrompt(prompt) {
    return prompt.trim().replace(/\s+/g, " ").replace(/[^\w\s\-.,!?()]/g, "");
  }
  /**
   * Normalize image generation type
   */
  static normalizeImageGenerationType(value) {
    return value === "image-to-image" ? "image-to-image" : "text-to-image";
  }
  /**
   * Ensure non-empty prompt with fallback
   */
  static ensureNonEmptyPrompt(input, fallback) {
    const str = typeof input === "string" ? input.trim() : "";
    return str.length > 0 ? str : fallback;
  }
  /**
   * Select image-to-image model
   */
  static async selectImageToImageModel(rawModelName, getAvailableImageModels, options) {
    const allowInpainting = options?.allowInpainting ?? false;
    const allImageModels = await getAvailableImageModels();
    const allI2I = allImageModels.filter(
      (m) => m.type === "image_to_image"
    );
    const wants = String(rawModelName || "");
    const baseToken = wants.toLowerCase().includes("flux") ? "flux" : wants.split("/").pop()?.split("-")[0] || wants.toLowerCase();
    const candidates = allowInpainting ? allI2I : allI2I.filter((m) => !/inpaint/i.test(String(m.name || "")));
    let pick = candidates.find(
      (m) => String(m.name || "").toLowerCase() === wants.toLowerCase() || String(m.label || "").toLowerCase() === wants.toLowerCase()
    );
    if (!pick && baseToken) {
      pick = candidates.find(
        (m) => String(m.name || "").toLowerCase().includes(baseToken) || String(m.label || "").toLowerCase().includes(baseToken)
      );
    }
    if (!pick && candidates.length > 0) pick = candidates[0];
    return pick?.name || null;
  }
};
var TextToVideoStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/video",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Text-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.duration <= 0 || params.duration > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }
    if (params.fps && (params.fps < 1 || params.fps > 60)) {
      throw new Error("FPS must be between 1 and 60");
    }
  }
};
var textToVideoStrategy = new TextToVideoStrategy();
var VideoToVideoStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_video: params.inputVideo,
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1,
        strength: params.strength || 0.75
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/video-to-video",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Video-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputVideo) {
      throw new Error("Input video is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.duration <= 0 || params.duration > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }
    if (params.fps && (params.fps < 1 || params.fps > 60)) {
      throw new Error("FPS must be between 1 and 60");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
  }
};
var videoToVideoStrategy = new VideoToVideoStrategy();

// src/video-generation/utils.ts
var DEFAULT_VIDEO_CONFIG = {
  defaultModel: "veo-2",
  maxDuration: 60,
  minDuration: 1,
  supportedFps: [24, 25, 30, 60],
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 }
  ],
  defaultStrength: 0.75
};
var VideoGenerationUtils = class {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width, height) {
    return DEFAULT_VIDEO_CONFIG.supportedResolutions.some(
      (res) => res.width === width && res.height === height
    );
  }
  /**
   * Get closest supported resolution
   */
  static getClosestResolution(width, height) {
    let closest = DEFAULT_VIDEO_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;
    for (const res of DEFAULT_VIDEO_CONFIG.supportedResolutions) {
      const distance = Math.sqrt(
        Math.pow(res.width - width, 2) + Math.pow(res.height - height, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = res;
      }
    }
    return closest;
  }
  /**
   * Validate duration
   */
  static validateDuration(duration) {
    return duration >= DEFAULT_VIDEO_CONFIG.minDuration && duration <= DEFAULT_VIDEO_CONFIG.maxDuration;
  }
  /**
   * Validate FPS
   */
  static validateFps(fps) {
    return DEFAULT_VIDEO_CONFIG.supportedFps.includes(fps);
  }
  /**
   * Get closest supported FPS
   */
  static getClosestFps(fps) {
    let closest = DEFAULT_VIDEO_CONFIG.supportedFps[0];
    let minDistance = Infinity;
    for (const supportedFps of DEFAULT_VIDEO_CONFIG.supportedFps) {
      const distance = Math.abs(supportedFps - fps);
      if (distance < minDistance) {
        minDistance = distance;
        closest = supportedFps;
      }
    }
    return closest;
  }
  /**
   * Calculate video file size estimate
   */
  static estimateFileSize(width, height, duration, fps) {
    const pixelsPerFrame = width * height;
    const totalFrames = duration * fps;
    return pixelsPerFrame * totalFrames;
  }
};
var BalanceService = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async getUserBalance(userId) {
    try {
      const response = await this.client.request({
        method: "GET",
        url: `/user/${userId}/balance`
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get user balance: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async addCredits(userId, amount, type) {
    try {
      const response = await this.client.request({
        method: "POST",
        url: `/user/${userId}/credits`,
        data: {
          amount,
          type,
          description: `${type === "purchase" ? "Credit purchase" : "Bonus credits"}`
        }
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to add credits: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async useCredits(userId, usage) {
    try {
      const response = await this.client.request({
        method: "POST",
        url: `/user/${userId}/credits/use`,
        data: usage
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to use credits: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    try {
      const response = await this.client.request({
        method: "GET",
        url: `/user/${userId}/transactions`,
        params: { limit, offset }
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get transaction history: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async getBalanceConfig() {
    try {
      const response = await this.client.request({
        method: "GET",
        url: "/config/balance"
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get balance config: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
};
var balanceService = new BalanceService();
var ArtifactService = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async getArtifact(id) {
    try {
      const response = await this.client.request({
        method: "GET",
        url: `/artifacts/${id}`
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async getUserArtifacts(userId, params) {
    try {
      const response = await this.client.request({
        method: "GET",
        url: `/user/${userId}/artifacts`,
        params
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get user artifacts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async createArtifact(artifact) {
    try {
      const response = await this.client.request({
        method: "POST",
        url: "/artifacts",
        data: artifact
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to create artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async updateArtifact(id, updates) {
    try {
      const response = await this.client.request({
        method: "PUT",
        url: `/artifacts/${id}`,
        data: updates
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to update artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async deleteArtifact(id) {
    try {
      await this.client.request({
        method: "DELETE",
        url: `/artifacts/${id}`
      });
    } catch (error) {
      throw new Error(
        `Failed to delete artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async getCollections(userId) {
    try {
      const response = await this.client.request({
        method: "GET",
        url: `/user/${userId}/collections`
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get collections: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async createCollection(collection) {
    try {
      const response = await this.client.request({
        method: "POST",
        url: "/collections",
        data: collection
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to create collection: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async addArtifactToCollection(collectionId, artifactId) {
    try {
      await this.client.request({
        method: "POST",
        url: `/collections/${collectionId}/artifacts`,
        data: { artifactId }
      });
    } catch (error) {
      throw new Error(
        `Failed to add artifact to collection: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  // Utility functions from existing artifacts server.ts
  static getThumbnailUrl(content) {
    try {
      const data = JSON.parse(content);
      if (!data) return null;
      if (typeof data.thumbnailUrl === "string") return data.thumbnailUrl;
      if (typeof data.thumbnail_url === "string") return data.thumbnail_url;
      if (typeof data.imageUrl === "string") return data.imageUrl;
      if (typeof data.videoUrl === "string") return data.videoUrl;
    } catch (_) {
    }
    return null;
  }
  static createDocumentHandler(config) {
    return {
      kind: config.kind,
      onCreateDocument: async (args) => {
        console.log(
          "\u{1F4C4} createDocumentHandler.onCreateDocument called for kind:",
          config.kind
        );
        const draftContent = await config.onCreateDocument({
          id: args.id,
          title: args.title,
          content: args.content,
          dataStream: args.dataStream,
          session: args.session
        });
        console.log("\u{1F4C4} Draft content generated:", draftContent);
        args.dataStream.writeData({
          type: "text-delta",
          content: draftContent
        });
        if (args.session?.user?.id) {
          let readableTitle = args.title;
          try {
            if (config.kind === "image" || config.kind === "video") {
              if (args.title.startsWith("{") && args.title.endsWith("}")) {
                const titleParams = JSON.parse(args.title);
                readableTitle = titleParams.prompt || `AI Generated ${config.kind}`;
              } else if (args.title.includes('Video: "')) {
                const promptMatch = args.title.match(/Video: "([^"]+)"/);
                if (promptMatch) {
                  readableTitle = promptMatch[1];
                }
              }
            }
          } catch (e) {
            console.warn("Failed to parse title for readable version:", e);
          }
          console.log("\u{1F4C4} Saving document:", {
            id: args.id,
            title: readableTitle,
            kind: config.kind,
            content: draftContent,
            userId: args.session.user.id
          });
        }
      },
      onUpdateDocument: async (args) => {
        console.log(
          "\u{1F4C4} createDocumentHandler.onUpdateDocument called for kind:",
          config.kind
        );
        const updatedContent = await config.onUpdateDocument({
          document: args.document,
          description: args.description,
          dataStream: args.dataStream,
          session: args.session
        });
        console.log("\u{1F4C4} Updated content generated:", updatedContent);
        args.dataStream.writeData({
          type: "text-delta",
          content: updatedContent
        });
        if (args.session?.user?.id) {
          console.log("\u{1F4C4} Updating document:", {
            id: args.document.id,
            content: updatedContent,
            userId: args.session.user.id
          });
        }
      }
    };
  }
};
var artifactService = new ArtifactService();

// src/ai-tools/tools.ts
var tool = (config) => config;
var generateUUID = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
var getDocumentById = async ({
  id
}) => {
  return null;
};
var saveSuggestions = async ({
  suggestions
}) => {
};
var documentHandlersByArtifactKind = [
  // This should be imported from the actual application
];
var artifactKinds = ["text", "sheet", "image", "video", "script"];
var createDocument = ({ session, dataStream }) => tool({
  description: "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
  parameters: {
    title: { type: "string" },
    kind: { type: "string", enum: artifactKinds },
    content: { type: "string", optional: true }
  },
  execute: async ({
    title,
    kind,
    content
  }) => {
    console.log("\u{1F4C4} ===== CREATE DOCUMENT TOOL CALLED =====");
    console.log("\u{1F4C4} KIND:", kind);
    console.log("\u{1F4C4} TITLE (first 100 chars):", title.substring(0, 100));
    console.log("\u{1F4C4} CONTENT provided:", content ? "Yes" : "No");
    console.log("\u{1F4C4} CONTENT length:", content?.length || 0);
    const id = generateUUID();
    console.log("\u{1F4C4} GENERATED ID:", id);
    console.log("\u{1F4C4} \u2705 WRITING KIND TO DATA STREAM...");
    dataStream.writeData({
      type: "kind",
      content: kind
    });
    console.log("\u{1F4C4} \u2705 WRITING ID TO DATA STREAM...");
    dataStream.writeData({
      type: "id",
      content: id
    });
    console.log("\u{1F4C4} \u2705 WRITING TITLE TO DATA STREAM...");
    dataStream.writeData({
      type: "title",
      content: title
    });
    console.log("\u{1F4C4} \u2705 WRITING CLEAR TO DATA STREAM...");
    dataStream.writeData({
      type: "clear",
      content: ""
    });
    console.log("\u{1F4C4} \u{1F50D} LOOKING FOR DOCUMENT HANDLER FOR KIND:", kind);
    console.log(
      "\u{1F4C4} \u{1F4CB} AVAILABLE HANDLERS:",
      documentHandlersByArtifactKind.map((h) => h.kind)
    );
    const documentHandler = documentHandlersByArtifactKind.find(
      (documentHandlerByArtifactKind) => documentHandlerByArtifactKind.kind === kind
    );
    if (!documentHandler) {
      console.error("\u{1F4C4} \u274C NO DOCUMENT HANDLER FOUND FOR KIND:", kind);
      throw new Error(`No document handler found for kind: ${kind}`);
    }
    console.log("\u{1F4C4} \u2705 FOUND DOCUMENT HANDLER, CALLING onCreateDocument...");
    try {
      await documentHandler.onCreateDocument({
        id,
        title,
        content,
        dataStream,
        session
      });
      console.log("\u{1F4C4} \u2705 DOCUMENT HANDLER COMPLETED SUCCESSFULLY");
    } catch (error) {
      console.error("\u{1F4C4} \u274C DOCUMENT HANDLER ERROR:", error);
      console.error(
        "\u{1F4C4} \u274C ERROR STACK:",
        error instanceof Error ? error.stack : "No stack"
      );
      throw error;
    }
    console.log("\u{1F4C4} \u2705 WRITING FINISH TO DATA STREAM...");
    dataStream.writeData({ type: "finish", content: "" });
    const result = {
      id,
      title,
      kind,
      content: "Document created successfully"
    };
    console.log("\u{1F4C4} \u2705 FINAL RESULT:", result);
    return result;
  }
});
var updateDocument = ({ session, dataStream }) => tool({
  description: "Update a document with the given description.",
  parameters: {
    id: { type: "string", description: "The ID of the document to update" },
    description: {
      type: "string",
      description: "The description of changes that need to be made"
    }
  },
  execute: async ({
    id,
    description
  }) => {
    const document = await getDocumentById({ id });
    if (!document) {
      return {
        error: "Document not found"
      };
    }
    dataStream.writeData({
      type: "clear",
      content: document.title
    });
    const documentHandler = documentHandlersByArtifactKind.find(
      (documentHandlerByArtifactKind) => documentHandlerByArtifactKind.kind === document.kind
    );
    if (!documentHandler) {
      throw new Error(`No document handler found for kind: ${document.kind}`);
    }
    await documentHandler.onUpdateDocument({
      document,
      description,
      dataStream,
      session
    });
    dataStream.writeData({ type: "finish", content: "" });
    return {
      id,
      title: document.title,
      kind: document.kind,
      content: "The document has been updated successfully."
    };
  }
});
var requestSuggestions = ({
  session,
  dataStream
}) => tool({
  description: "Request suggestions for a document",
  parameters: {
    documentId: {
      type: "string",
      description: "The ID of the document to request edits"
    }
  },
  execute: async ({ documentId }) => {
    const document = await getDocumentById({ id: documentId });
    if (!document || !document.content) {
      return {
        error: "Document not found"
      };
    }
    const suggestions = [];
    const mockSuggestions = [
      {
        originalText: "This is a sample sentence.",
        suggestedText: "This is an improved sample sentence.",
        description: "Enhanced clarity and flow",
        id: generateUUID(),
        documentId,
        isResolved: false
      }
    ];
    for (const suggestion of mockSuggestions) {
      dataStream.writeData({
        type: "suggestion",
        content: suggestion
      });
      suggestions.push(suggestion);
    }
    if (session.user?.id) {
      const userId = session.user.id;
      await saveSuggestions({
        suggestions: suggestions.map((suggestion) => ({
          ...suggestion,
          userId,
          createdAt: /* @__PURE__ */ new Date(),
          documentCreatedAt: document.createdAt
        }))
      });
    }
    return {
      id: documentId,
      title: document.title,
      kind: document.kind,
      message: "Suggestions have been added to the document"
    };
  }
});
var configureImageGenerationSchema = zod.z.object({
  prompt: zod.z.string().optional().describe("Detailed description of the image to generate"),
  sourceImageUrl: zod.z.string().url().optional().describe("Optional source image URL for image-to-image generation"),
  style: zod.z.string().optional().describe("Style of the image (realistic, cinematic, anime, etc.)"),
  resolution: zod.z.string().optional().describe("Image resolution (1920x1080, square, vertical, etc.)"),
  shotSize: zod.z.string().optional().describe("Shot size/camera angle (close-up, medium-shot, etc.)"),
  model: zod.z.string().optional().describe("AI model to use (FLUX, etc.)"),
  seed: zod.z.number().optional().describe("Seed for reproducible results"),
  batchSize: zod.z.number().min(1).max(3).optional().describe("Number of images to generate simultaneously (1-3)")
});
var ImageGenerationConfigurationTool = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Configure image generation settings
   */
  async configureImageGeneration(params) {
    try {
      const validatedParams = configureImageGenerationSchema.parse(params);
      if (!validatedParams.prompt) {
        const config = await this.getImageGenerationConfig();
        return {
          config,
          message: "Image generation configuration loaded. Please provide a prompt to start generation.",
          suggestions: [
            "Describe the image you want to generate in detail",
            "Choose a style that matches your vision",
            "Select appropriate resolution for your needs",
            "Consider the shot size for composition"
          ],
          nextSteps: [
            "Enter a detailed prompt",
            "Select generation parameters",
            "Click generate to start"
          ]
        };
      }
      return await this.startImageGeneration(validatedParams);
    } catch (error) {
      throw new Error(
        `Image generation configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get image generation configuration
   */
  async getImageGenerationConfig() {
    try {
      const response = await this.client.request({
        method: "GET",
        url: "/api/config/image-generation"
      });
      return {
        availableModels: this.parseMediaOptions(response.availableModels),
        availableResolutions: this.parseMediaOptions(response.availableResolutions),
        availableStyles: this.parseMediaOptions(response.availableStyles),
        availableShotSizes: this.parseMediaOptions(response.availableShotSizes),
        supportedFormats: response.supportedFormats || ["PNG", "JPEG", "WEBP"],
        maxBatchSize: response.maxBatchSize || 3,
        qualityOptions: this.parseMediaOptions(response.qualityOptions),
        defaultSettings: response.defaultSettings || {
          model: "comfyui/flux",
          resolution: "1024x1024",
          style: "realistic",
          shotSize: "medium-shot"
        }
      };
    } catch (error) {
      return this.getDefaultImageConfig();
    }
  }
  /**
   * Start image generation
   */
  async startImageGeneration(params) {
    try {
      const generationRequest = {
        prompt: params.prompt,
        sourceImageUrl: params.sourceImageUrl,
        style: params.style || "realistic",
        resolution: params.resolution || "1024x1024",
        shotSize: params.shotSize || "medium-shot",
        model: params.model || "comfyui/flux",
        seed: params.seed,
        batchSize: params.batchSize || 1
      };
      const response = await this.client.request({
        method: "POST",
        url: "/api/generate/image",
        data: generationRequest
      });
      if (response.success) {
        return {
          config: await this.getImageGenerationConfig(),
          message: response.message || "Image generation started successfully!",
          suggestions: [
            "Monitor generation progress in real-time",
            "Adjust parameters if needed",
            "Save generated images to your gallery"
          ],
          nextSteps: [
            "Wait for generation to complete",
            "Review and download results",
            "Share or save to gallery"
          ]
        };
      } else {
        throw new Error(response.message || "Failed to start image generation");
      }
    } catch (error) {
      throw new Error(
        `Failed to start image generation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Parse media options from API response
   */
  parseMediaOptions(options) {
    return options.map((option) => ({
      id: option.id || option.name || "",
      name: option.name || option.id || "",
      label: option.label || option.name || option.id || "",
      description: option.description || "",
      category: option.category || "",
      tags: option.tags || []
    }));
  }
  /**
   * Get default image generation configuration
   */
  getDefaultImageConfig() {
    return {
      availableModels: [
        { id: "comfyui/flux", name: "FLUX", label: "FLUX Pro", description: "High-quality image generation", category: "pro" },
        { id: "comfyui/flux-dev", name: "FLUX Dev", label: "FLUX Dev", description: "Development version", category: "dev" }
      ],
      availableResolutions: [
        { id: "1024x1024", name: "1024x1024", label: "Square HD", description: "Standard square format" },
        { id: "1920x1080", name: "1920x1080", label: "Full HD", description: "Widescreen format" },
        { id: "1080x1920", name: "1080x1920", label: "Portrait HD", description: "Vertical format" }
      ],
      availableStyles: [
        { id: "realistic", name: "Realistic", label: "Realistic", description: "Photorealistic style" },
        { id: "cinematic", name: "Cinematic", label: "Cinematic", description: "Movie-like style" },
        { id: "anime", name: "Anime", label: "Anime", description: "Japanese animation style" }
      ],
      availableShotSizes: [
        { id: "close-up", name: "Close-up", label: "Close-up", description: "Tight framing" },
        { id: "medium-shot", name: "Medium Shot", label: "Medium Shot", description: "Balanced framing" },
        { id: "long-shot", name: "Long Shot", label: "Long Shot", description: "Wide framing" }
      ],
      supportedFormats: ["PNG", "JPEG", "WEBP"],
      maxBatchSize: 3,
      qualityOptions: [
        { id: "standard", name: "Standard", label: "Standard", description: "Good quality, fast generation" },
        { id: "high", name: "High", label: "High", description: "Better quality, slower generation" }
      ],
      defaultSettings: {
        model: "comfyui/flux",
        resolution: "1024x1024",
        style: "realistic",
        shotSize: "medium-shot"
      }
    };
  }
};
var imageGenerationConfigurationTool = new ImageGenerationConfigurationTool();

// src/ai-tools/configuration/video-generation.ts
var videoGenerationConfigurationTool = {
  // TODO: Implement video generation configuration
};

// src/ai-tools/configuration/script-generation.ts
var scriptGenerationConfigurationTool = {
  // TODO: Implement script generation configuration
};

// src/ai-tools/image-generation-tools.ts
var tool2 = (config) => config;
var getImageGenerationConfig = async () => {
  return {
    availableModels: [],
    availableResolutions: [],
    availableStyles: []
  };
};
var checkBalanceBeforeArtifact = async (session, operation) => {
  return { hasBalance: true };
};
var getOperationDisplayName = (operation) => {
  return operation;
};
var configureImageGeneration = (params) => tool2({
  description: "Configure image generation settings or generate an image directly if prompt is provided. Supports text-to-image by default, and image-to-image when a sourceImageUrl is provided. When triggered, creates an image artifact that shows generation progress in real-time.",
  parameters: {
    prompt: {
      type: "string",
      optional: true,
      description: "Detailed description of the image to generate. If provided, will immediately create image artifact and start generation"
    },
    sourceImageUrl: {
      type: "string",
      optional: true,
      description: "Optional source image URL for image-to-image generation (e.g., when the user uploaded an image in chat). If provided, the system will run image-to-image."
    },
    style: {
      type: "string",
      optional: true,
      description: 'Style of the image. Supports many formats: "realistic", "cinematic", "anime", "cartoon", "sketch", "painting", "steampunk", "fantasy", "sci-fi", "horror", "minimalist", "abstract", "portrait", "landscape", and many more available styles'
    },
    resolution: {
      type: "string",
      optional: true,
      description: 'Image resolution. Accepts various formats: "1920x1080", "1920\xD71080", "1920 x 1080", "full hd", "fhd", "1080p", "square", "vertical", "horizontal", etc.'
    },
    shotSize: {
      type: "string",
      optional: true,
      description: 'Shot size/camera angle. Accepts: "close-up", "medium-shot", "long-shot", "extreme-close-up", "portrait", "two-shot", etc.'
    },
    model: {
      type: "string",
      optional: true,
      description: 'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "FLUX" or full model ID.'
    },
    seed: {
      type: "number",
      optional: true,
      description: "Seed for reproducible results"
    },
    batchSize: {
      type: "number",
      optional: true,
      min: 1,
      max: 3,
      description: "Number of images to generate simultaneously (1-3). Higher batch sizes generate multiple variations at once."
    }
  },
  execute: async ({
    prompt,
    sourceImageUrl,
    style,
    resolution,
    shotSize,
    model,
    seed,
    batchSize
  }) => {
    console.log("\u{1F527} configureImageGeneration called with:", {
      prompt,
      style,
      resolution,
      shotSize,
      model,
      seed,
      batchSize
    });
    console.log("\u{1F5BC}\uFE0F Loading image configuration from OpenAPI factory...");
    const config = await getImageGenerationConfig();
    console.log("\u{1F5BC}\uFE0F \u2705 Loaded image config:", {
      modelsCount: config.availableModels.length,
      resolutionsCount: config.availableResolutions.length,
      stylesCount: config.availableStyles.length
    });
    if (!prompt) {
      console.log("\u{1F5BC}\uFE0F No prompt provided, returning configuration panel");
      return {
        type: "configuration_panel",
        message: "Image generation configuration panel opened. Please provide a prompt to generate an image.",
        config: {
          availableModels: config.availableModels,
          availableResolutions: config.availableResolutions,
          availableStyles: config.availableStyles
        }
      };
    }
    if (params?.session) {
      const balanceCheck = await checkBalanceBeforeArtifact(
        params.session);
      if (!balanceCheck.hasBalance) {
        return {
          error: "Insufficient balance for image generation",
          operation: getOperationDisplayName("image_generation")
        };
      }
    }
    console.log("\u{1F5BC}\uFE0F Creating image artifact and starting generation...");
    return {
      type: "image_generation_started",
      message: "Image generation started successfully",
      prompt,
      sourceImageUrl,
      style,
      resolution,
      shotSize,
      model,
      seed,
      batchSize,
      artifactId: "placeholder-artifact-id"
    };
  }
});

// src/ai-tools/video-generation-tools.ts
var tool3 = (config) => config;
async function getStyles() {
  return { items: [] };
}
function findStyle(style, styles) {
  return styles.find((s) => s.id === style || s.label === style);
}
async function createVideoMediaSettings() {
  return { availableModels: [] };
}
async function getBestVideoModel(params) {
  return null;
}
var VIDEO_RESOLUTIONS = [];
var SHOT_SIZES = [];
var VIDEO_FRAME_RATES = [];
var DEFAULT_VIDEO_RESOLUTION = { label: "HD" };
var DEFAULT_VIDEO_DURATION = 5;
function getModelCompatibleResolutions(modelName) {
  return VIDEO_RESOLUTIONS;
}
function getDefaultResolutionForModel(modelName) {
  return DEFAULT_VIDEO_RESOLUTION;
}
async function checkBalanceBeforeArtifact2(session, operation, operationType, multipliers, operationDisplayName) {
  return { valid: true, cost: 0 };
}
function getOperationDisplayName2(operationType) {
  return operationType;
}
function convertSourceToEnum(source) {
  switch (source) {
    case "local":
      return "local" /* LOCAL */;
    case "fal_ai":
      return "fal_ai" /* FAL_AI */;
    case "google_cloud":
      return "google_cloud" /* GOOGLE_CLOUD */;
    case "azure_openai_sora":
      return "azure_openai_sora" /* AZURE_OPENAI_SORA */;
    case "azure_openai_image":
      return "azure_openai_image" /* AZURE_OPENAI_IMAGE */;
    default:
      return "local" /* LOCAL */;
  }
}
function convertTypeToEnum(type) {
  switch (type) {
    case "text_to_video":
      return "text_to_video" /* TEXT_TO_VIDEO */;
    case "image_to_video":
      return "image_to_video" /* IMAGE_TO_VIDEO */;
    case "text_to_image":
      return "text_to_image" /* TEXT_TO_IMAGE */;
    case "image_to_image":
      return "image_to_image" /* IMAGE_TO_IMAGE */;
    default:
      return "text_to_video" /* TEXT_TO_VIDEO */;
  }
}
var configureVideoGeneration = (params) => tool3({
  description: "Configure video generation settings or generate a video directly if prompt is provided. When prompt is provided, this will create a video artifact that shows generation progress in real-time. Available models are loaded dynamically from SuperDuperAI API.",
  parameters: {
    prompt: {
      type: "string",
      optional: true,
      description: "Detailed description of the video to generate. If provided, will immediately create video artifact and start generation"
    },
    negativePrompt: {
      type: "string",
      optional: true,
      description: "What to avoid in the video generation"
    },
    style: {
      type: "string",
      optional: true,
      description: "Style of the video"
    },
    resolution: {
      type: "string",
      optional: true,
      description: 'Video resolution (e.g., "1344x768", "1024x1024"). Default is HD 1344x768 for cost efficiency.'
    },
    shotSize: {
      type: "string",
      optional: true,
      description: "Shot size for the video (extreme-long-shot, long-shot, medium-shot, medium-close-up, close-up, extreme-close-up, two-shot, detail-shot)"
    },
    model: {
      type: "string",
      optional: true,
      description: 'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "LTX" or full model ID. For image-to-video models (VEO, KLING), a source image is required.'
    },
    frameRate: {
      type: "number",
      optional: true,
      description: "Frame rate in FPS (24, 30, 60, 120)"
    },
    duration: {
      type: "number",
      optional: true,
      description: "Video duration in seconds. Default is 5 seconds for cost efficiency."
    },
    sourceImageId: {
      type: "string",
      optional: true,
      description: "ID of source image for image-to-video models (VEO, KLING). Required for image-to-video generation."
    },
    sourceImageUrl: {
      type: "string",
      optional: true,
      description: "URL of source image for image-to-video models. Alternative to sourceImageId."
    },
    generationType: {
      type: "string",
      enum: ["text-to-video", "image-to-video"],
      optional: true,
      description: 'Generation mode: "text-to-video" for text prompts only, "image-to-video" when using source image'
    }
  },
  execute: async ({
    prompt,
    negativePrompt,
    style,
    resolution,
    shotSize,
    model,
    frameRate,
    duration,
    sourceImageId,
    sourceImageUrl,
    generationType
  }) => {
    console.log("\u{1F527} configureVideoGeneration called with:", {
      prompt,
      negativePrompt,
      style,
      resolution,
      shotSize,
      model,
      frameRate,
      duration
    });
    console.log("\u{1F527} createDocument available:", !!params?.createDocument);
    const defaultResolution = DEFAULT_VIDEO_RESOLUTION;
    const defaultStyle = {
      id: "flux_steampunk",
      label: "Steampunk",
      description: "Steampunk style"
    };
    const defaultShotSize = SHOT_SIZES.find((s) => s.id === "long-shot") || SHOT_SIZES[0];
    console.log(
      "\u{1F3AC} Loading video models from SuperDuperAI API via factory..."
    );
    const videoSettings = await createVideoMediaSettings();
    const availableModels = videoSettings.availableModels;
    console.log(
      "\u{1F3AC} \u2705 Loaded video models:",
      availableModels.map((m) => m.id)
    );
    const bestModel = await getBestVideoModel();
    const defaultModel = bestModel ? {
      ...bestModel,
      id: bestModel.name,
      label: bestModel.label || bestModel.name,
      description: `${bestModel.label || bestModel.name} - ${bestModel.type}`,
      value: bestModel.name,
      workflowPath: bestModel.params?.workflow_path || "",
      price: bestModel.params?.price_per_second || bestModel.price || 0,
      type: convertTypeToEnum(bestModel.type),
      source: convertSourceToEnum(bestModel.source)
    } : availableModels.find((m) => m.name === "azure-openai/sora") || availableModels[0];
    console.log(
      "\u{1F3AF} Smart default model selected:",
      defaultModel.label,
      "(type:",
      defaultModel.type,
      ")"
    );
    let styles = [];
    try {
      const response = await getStyles();
      if ("error" in response) {
        console.error(response.error);
      } else {
        styles = response.items.map((style2) => ({
          id: style2.name,
          label: style2.title ?? style2.name,
          description: style2.title ?? style2.name
        }));
      }
    } catch (err) {
      console.log(err);
    }
    if (!prompt) {
      console.log(
        "\u{1F527} No prompt provided, returning video configuration panel"
      );
      const config = {
        type: "video-generation-settings",
        availableResolutions: getModelCompatibleResolutions(
          defaultModel.name || defaultModel.id || ""
        ),
        availableStyles: styles,
        availableShotSizes: SHOT_SIZES,
        availableModels,
        availableFrameRates: VIDEO_FRAME_RATES,
        defaultSettings: {
          resolution: getDefaultResolutionForModel(
            defaultModel.name || defaultModel.id || ""
          ),
          style: defaultStyle,
          shotSize: defaultShotSize,
          model: defaultModel,
          frameRate: 30,
          duration: DEFAULT_VIDEO_DURATION,
          // 5 seconds for economy
          negativePrompt: "",
          seed: void 0
        }
      };
      return config;
    }
    console.log("\u{1F527} \u2705 PROMPT PROVIDED, CREATING VIDEO DOCUMENT:", prompt);
    console.log("\u{1F527} \u2705 PARAMS OBJECT:", !!params);
    console.log("\u{1F527} \u2705 CREATE DOCUMENT AVAILABLE:", !!params?.createDocument);
    if (!params?.createDocument) {
      console.log(
        "\u{1F527} \u274C createDocument not available, returning basic config"
      );
      const config = {
        type: "video-generation-settings",
        availableResolutions: getModelCompatibleResolutions(
          defaultModel.name || defaultModel.id || ""
        ),
        availableStyles: styles,
        availableShotSizes: SHOT_SIZES,
        availableModels,
        availableFrameRates: VIDEO_FRAME_RATES,
        defaultSettings: {
          resolution: getDefaultResolutionForModel(
            defaultModel.name || defaultModel.id || ""
          ),
          style: defaultStyle,
          shotSize: defaultShotSize,
          model: defaultModel,
          frameRate: frameRate || 30,
          duration: duration || DEFAULT_VIDEO_DURATION,
          negativePrompt: negativePrompt || "",
          seed: void 0
        }
      };
      return config;
    }
    try {
      const selectedModel = model ? availableModels.find(
        (m) => m.label === model || m.id === model || m.apiName === model
      ) || defaultModel : defaultModel;
      const compatibleResolutions = getModelCompatibleResolutions(
        selectedModel.name || selectedModel.id || ""
      );
      let selectedResolution = defaultResolution;
      if (resolution) {
        const requestedResolution = VIDEO_RESOLUTIONS.find(
          (r) => r.label === resolution
        );
        if (requestedResolution) {
          const isCompatible = compatibleResolutions.some(
            (r) => r.label === requestedResolution.label
          );
          if (isCompatible) {
            selectedResolution = requestedResolution;
          } else {
            selectedResolution = getDefaultResolutionForModel(
              selectedModel.name || selectedModel.id || ""
            );
            console.log(
              `\u{1F527} \u26A0\uFE0F Resolution ${resolution} not compatible with model ${selectedModel.name}, using ${selectedResolution.label} instead`
            );
          }
        }
      } else {
        selectedResolution = getDefaultResolutionForModel(
          selectedModel.name || selectedModel.id || ""
        );
      }
      let selectedStyle = defaultStyle;
      if (style) {
        const foundStyle = findStyle(style, styles);
        if (foundStyle) {
          selectedStyle = foundStyle;
          console.log(
            "\u{1F527} \u2705 STYLE MATCHED:",
            style,
            "->",
            selectedStyle.label
          );
        } else {
          console.log(
            "\u{1F527} \u26A0\uFE0F STYLE NOT FOUND:",
            style,
            "using default:",
            defaultStyle.label
          );
          console.log(
            "\u{1F527} \u{1F4CB} Available styles:",
            styles.map((s) => s.label).slice(0, 5).join(", "),
            "..."
          );
          const commonStyleFallbacks = [
            "flux_steampunk",
            "steampunk",
            "flux_realistic",
            "realistic",
            "flux_cinematic",
            "cinematic",
            "flux_anime",
            "anime",
            "flux_fantasy",
            "fantasy",
            "default"
          ];
          for (const fallbackId of commonStyleFallbacks) {
            const fallbackStyle = styles.find(
              (s) => s.id.toLowerCase().includes(fallbackId.toLowerCase()) || s.label.toLowerCase().includes(fallbackId.toLowerCase())
            );
            if (fallbackStyle) {
              selectedStyle = fallbackStyle;
              console.log(
                "\u{1F527} \u{1F504} FALLBACK STYLE FOUND:",
                fallbackId,
                "->",
                selectedStyle.label
              );
              break;
            }
          }
          if (selectedStyle === defaultStyle && styles.length > 0) {
            selectedStyle = styles[0];
            console.log(
              "\u{1F527} \u{1F504} USING FIRST AVAILABLE STYLE:",
              selectedStyle.label
            );
          }
        }
      } else {
        const preferredDefaults = [
          "flux_steampunk",
          "steampunk",
          "flux_realistic",
          "realistic"
        ];
        for (const preferredId of preferredDefaults) {
          const preferredStyle = styles.find(
            (s) => s.id.toLowerCase().includes(preferredId.toLowerCase()) || s.label.toLowerCase().includes(preferredId.toLowerCase())
          );
          if (preferredStyle) {
            selectedStyle = preferredStyle;
            console.log(
              "\u{1F527} \u{1F3AF} USING PREFERRED DEFAULT STYLE:",
              preferredStyle.label
            );
            break;
          }
        }
        if (selectedStyle === defaultStyle && styles.length > 0) {
          selectedStyle = styles[0];
          console.log(
            "\u{1F527} \u{1F3AF} USING FIRST AVAILABLE AS DEFAULT:",
            selectedStyle.label
          );
        }
      }
      const selectedShotSize = shotSize ? SHOT_SIZES.find((s) => s.label === shotSize || s.id === shotSize) || defaultShotSize : defaultShotSize;
      const isImageToVideoModel = selectedModel.type === "image_to_video";
      console.log("\u{1F527} \u{1F3AF} Model type check:", {
        modelId: selectedModel.id,
        modelName: selectedModel.label,
        apiType: selectedModel.type,
        isImageToVideo: isImageToVideoModel
      });
      if (isImageToVideoModel && !sourceImageId && !sourceImageUrl) {
        return {
          error: `The selected model "${selectedModel.label}" is an image-to-video model and requires a source image. Please provide either sourceImageId or sourceImageUrl parameter, or select a text-to-video model.`,
          suggestion: "You can use a recently generated image from this chat as the source, or upload a new image first.",
          availableTextToVideoModels: availableModels.filter(
            (m) => m.type === "text_to_video" || m.type !== "image_to_video"
          ).map((m) => `${m.label} (${m.id})`)
        };
      }
      const autoGenerationType = sourceImageId || sourceImageUrl ? "image-to-video" : "text-to-video";
      const finalGenerationType = generationType || autoGenerationType;
      console.log("\u{1F527} \u{1F3AF} Generation type determination:", {
        provided: generationType,
        autoDetected: autoGenerationType,
        final: finalGenerationType,
        hasSourceImage: !!(sourceImageId || sourceImageUrl)
      });
      const videoParams = {
        prompt,
        negativePrompt: negativePrompt || "",
        style: selectedStyle,
        resolution: selectedResolution,
        shotSize: selectedShotSize,
        model: selectedModel,
        frameRate: frameRate || 30,
        duration: duration || DEFAULT_VIDEO_DURATION,
        // Use economical default
        sourceImageId: sourceImageId || void 0,
        sourceImageUrl: sourceImageUrl || void 0,
        generationType: finalGenerationType
      };
      console.log("\u{1F527} \u2705 CREATING VIDEO DOCUMENT WITH PARAMS:", videoParams);
      const operationType = finalGenerationType === "image-to-video" ? "image-to-video" : "text-to-video";
      const multipliers = [];
      if (duration) {
        if (duration <= 5) multipliers.push("duration-5s");
        else if (duration <= 10) multipliers.push("duration-10s");
        else if (duration <= 15) multipliers.push("duration-15s");
        else if (duration <= 30) multipliers.push("duration-30s");
      } else {
        multipliers.push("duration-5s");
      }
      if (selectedResolution.label.includes("HD") || selectedResolution.label.includes("720")) {
        multipliers.push("hd-quality");
      } else if (selectedResolution.label.includes("4K") || selectedResolution.label.includes("2160")) {
        multipliers.push("4k-quality");
      }
      const balanceCheck = await checkBalanceBeforeArtifact2(
        params?.session || null,
        "video-generation",
        operationType,
        multipliers,
        getOperationDisplayName2(operationType)
      );
      if (!balanceCheck.valid) {
        console.log("\u{1F527} \u274C INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
        return {
          error: balanceCheck.userMessage || "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0432\u0438\u0434\u0435\u043E",
          balanceError: true,
          requiredCredits: balanceCheck.cost
        };
      }
      if (params?.createDocument) {
        console.log("\u{1F527} \u2705 CALLING CREATE DOCUMENT WITH KIND: video");
        try {
          const readableTitle2 = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
          const result = await params.createDocument.execute({
            title: readableTitle2,
            kind: "video"
          });
          console.log("\u{1F527} \u2705 CREATE DOCUMENT RESULT:", result);
          return {
            ...result,
            message: `I'm creating a video with description: "${prompt}". Using economical HD settings (${selectedResolution.label}, ${duration || DEFAULT_VIDEO_DURATION}s) for cost efficiency. Artifact created and generation started.`
          };
        } catch (error) {
          console.error("\u{1F527} \u274C CREATE DOCUMENT ERROR:", error);
          console.error(
            "\u{1F527} \u274C ERROR STACK:",
            error instanceof Error ? error.stack : "No stack"
          );
          throw error;
        }
      }
      console.log("\u{1F527} \u274C CREATE DOCUMENT NOT AVAILABLE, RETURNING FALLBACK");
      const readableTitle = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
      return {
        message: `I'll create a video with description: "${prompt}". However, artifact cannot be created - createDocument unavailable.`,
        parameters: {
          title: readableTitle,
          kind: "video"
        }
      };
    } catch (error) {
      console.error("\u{1F527} \u274C ERROR CREATING VIDEO DOCUMENT:", error);
      return {
        error: `Failed to create video document: ${error.message}`,
        fallbackConfig: {
          type: "video-generation-settings",
          availableResolutions: getModelCompatibleResolutions(
            defaultModel.name || defaultModel.id || ""
          ),
          availableStyles: styles,
          availableShotSizes: SHOT_SIZES,
          availableModels,
          availableFrameRates: VIDEO_FRAME_RATES,
          defaultSettings: {
            resolution: getDefaultResolutionForModel(
              defaultModel.name || defaultModel.id || ""
            ),
            style: defaultStyle,
            shotSize: defaultShotSize,
            model: defaultModel,
            frameRate: frameRate || 30,
            duration: duration || DEFAULT_VIDEO_DURATION,
            negativePrompt: negativePrompt || "",
            seed: void 0
          }
        }
      };
    }
  }
});

// src/ai-tools/video-models-tools.ts
var tool4 = (config) => config;
async function getAvailableVideoModels() {
  return [];
}
var listVideoModels = tool4({
  description: "List all available video generation models from SuperDuperAI API with their capabilities, pricing, and requirements. Use this to see what models are available before generating videos.",
  parameters: {
    format: {
      type: "string",
      enum: ["detailed", "simple", "agent-friendly"],
      optional: true,
      description: "Format of the output: detailed (full info), simple (names only), agent-friendly (formatted for AI agents)"
    },
    filterByPrice: {
      type: "number",
      optional: true,
      description: "Filter models by maximum price per second"
    },
    filterByDuration: {
      type: "number",
      optional: true,
      description: "Filter models that support this duration in seconds"
    },
    excludeVip: {
      type: "boolean",
      optional: true,
      description: "Exclude VIP-only models"
    }
  },
  execute: async ({
    format = "agent-friendly",
    filterByPrice,
    filterByDuration,
    excludeVip
  }) => {
    try {
      console.log(
        "\u{1F3AC} \u{1F4CB} Listing video models from SuperDuperAI with format:",
        format
      );
      const allModels = await getAvailableVideoModels();
      let videoModels = allModels.map((m) => m);
      if (filterByPrice) {
        videoModels = videoModels.filter(
          (m) => (m.params.price_per_second || m.params.price || 0) <= filterByPrice
        );
      }
      if (filterByDuration) {
        videoModels = videoModels.filter(
          (m) => (m.params.max_duration || m.params.available_durations?.[0] || 60) >= filterByDuration
        );
      }
      if (excludeVip) {
        videoModels = videoModels.filter((m) => !m.params.is_vip);
      }
      if (format === "agent-friendly") {
        const agentInfo = {
          models: videoModels.map((m) => ({
            id: m.name,
            // Use name as id
            name: m.name,
            description: m.label || m.name,
            price_per_second: m.params.price_per_second || m.params.price || 0,
            max_duration: m.params.max_duration || 60,
            vip_required: m.params.is_vip || false,
            supported_resolutions: `${m.params.max_width || 1920}x${m.params.max_height || 1080}`,
            frame_rates: m.params.frame_rates || [24, 30],
            aspect_ratios: m.params.aspect_ratios || ["16:9"]
          })),
          usage_examples: [
            'Use model ID like "comfyui/ltx" when calling configureVideoGeneration',
            "Check max_duration before setting video duration",
            "Consider price_per_second for cost optimization"
          ],
          total: videoModels.length
        };
        return {
          success: true,
          data: agentInfo,
          message: `Found ${videoModels.length} video models from SuperDuperAI API`
        };
      }
      if (format === "simple") {
        const simpleList = videoModels.map((m) => ({
          id: m.name,
          name: m.name,
          price: m.params.price_per_second || m.params.price || 0,
          max_duration: m.params.max_duration || 60,
          vip: m.params.is_vip || false
        }));
        return {
          success: true,
          data: simpleList,
          total: simpleList.length,
          message: `Found ${simpleList.length} video models`
        };
      }
      const detailedList = videoModels.map((m) => ({
        id: m.name,
        name: m.name,
        description: m.label || m.name,
        price_per_second: m.params.price_per_second || m.params.price || 0,
        max_duration: m.params.max_duration || 60,
        max_resolution: {
          width: m.params.max_width || 1920,
          height: m.params.max_height || 1080
        },
        supported_frame_rates: m.params.frame_rates || [24, 30],
        supported_aspect_ratios: m.params.aspect_ratios || ["16:9"],
        supported_qualities: m.params.qualities || ["hd"],
        vip_required: m.params.is_vip || false,
        workflow_path: m.params.workflow_path || ""
      }));
      return {
        success: true,
        data: detailedList,
        total: detailedList.length,
        message: `Found ${detailedList.length} video models with detailed information`,
        filters_applied: {
          max_price: filterByPrice,
          duration: filterByDuration,
          exclude_vip: excludeVip
        }
      };
    } catch (error) {
      console.error("\u{1F3AC} \u274C Error listing video models:", error);
      return {
        success: false,
        error: error?.message || "Failed to list video models from SuperDuperAI API",
        message: "Could not retrieve video models. Please check SUPERDUPERAI_TOKEN and SUPERDUPERAI_URL environment variables."
      };
    }
  }
});
var findBestVideoModel = tool4({
  description: "Find the best video model from SuperDuperAI based on specific requirements like price, duration, and VIP access. Use this to automatically select the optimal model for your needs.",
  parameters: {
    maxPrice: {
      type: "number",
      optional: true,
      description: "Maximum price per second you want to pay"
    },
    preferredDuration: {
      type: "number",
      optional: true,
      description: "Preferred video duration in seconds"
    },
    vipAllowed: {
      type: "boolean",
      optional: true,
      description: "Whether VIP models are allowed (default: true)"
    },
    prioritizeQuality: {
      type: "boolean",
      optional: true,
      description: "Prioritize quality over price (default: false)"
    }
  },
  execute: async ({
    maxPrice,
    preferredDuration,
    vipAllowed = true,
    prioritizeQuality = false
  }) => {
    try {
      console.log("\u{1F3AC} \u{1F50D} Finding best video model with criteria:", {
        maxPrice,
        preferredDuration,
        vipAllowed,
        prioritizeQuality
      });
      const allModels = await getAvailableVideoModels();
      let candidates = allModels.map((m) => m);
      if (maxPrice) {
        candidates = candidates.filter(
          (m) => (m.params.price_per_second || m.params.price || 0) <= maxPrice
        );
      }
      if (preferredDuration) {
        candidates = candidates.filter(
          (m) => (m.params.max_duration || 60) >= preferredDuration
        );
      }
      if (!vipAllowed) {
        candidates = candidates.filter((m) => !m.params.is_vip);
      }
      if (candidates.length === 0) {
        return {
          success: false,
          message: "No video model found matching your criteria",
          suggestion: "Try relaxing your requirements (higher price limit, allow VIP models, etc.)",
          available_models: allModels.map((m) => ({
            id: m.name,
            name: m.name,
            price: m.params.price_per_second || m.params.price || 0,
            max_duration: m.params.max_duration || 60,
            vip: m.params.is_vip || false
          }))
        };
      }
      let bestModel;
      if (prioritizeQuality) {
        bestModel = candidates.sort(
          (a, b) => (b.params.price_per_second || b.params.price || 0) - (a.params.price_per_second || a.params.price || 0)
        )[0];
      } else {
        bestModel = candidates.sort(
          (a, b) => (a.params.price_per_second || a.params.price || 0) - (b.params.price_per_second || b.params.price || 0)
        )[0];
      }
      return {
        success: true,
        data: {
          id: bestModel.name,
          name: bestModel.name,
          description: bestModel.label || bestModel.name,
          price_per_second: bestModel.params.price_per_second || bestModel.params.price || 0,
          max_duration: bestModel.params.max_duration || 60,
          max_resolution: {
            width: bestModel.params.max_width || 1920,
            height: bestModel.params.max_height || 1080
          },
          vip_required: bestModel.params.is_vip || false,
          recommendation_reason: `Selected based on ${prioritizeQuality ? "quality" : "price"} optimization`
        },
        message: `Best model found: ${bestModel.name} at $${bestModel.params.price_per_second || bestModel.params.price || 0}/sec`,
        usage_tip: `Use model ID "${bestModel.name}" when calling configureVideoGeneration`
      };
    } catch (error) {
      console.error("\u{1F3AC} \u274C Error finding best video model:", error);
      return {
        success: false,
        error: error?.message || "Failed to find best video model",
        message: "Could not find optimal video model. Please check SuperDuperAI API connection."
      };
    }
  }
});
var _PromptEnhancer = class _PromptEnhancer {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params) {
    try {
      this.validateParams(params);
      const enhancementRequest = {
        prompt: params.prompt,
        style: params.style || "professional",
        language: params.language || "en",
        targetModel: params.targetModel || "image",
        length: params.length || "medium",
        includeExamples: params.includeExamples || false
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/enhance-prompt",
        data: enhancementRequest
      });
      const metadata = {
        language: params.language || "en",
        style: params.style || "professional",
        length: params.length || "medium",
        targetModel: params.targetModel || "image",
        wordCount: this.countWords(response.enhancedPrompt),
        estimatedTokens: this.estimateTokens(response.enhancedPrompt)
      };
      return {
        original: params.prompt,
        enhanced: response.enhancedPrompt,
        suggestions: response.suggestions,
        confidence: response.confidence,
        metadata
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get available prompt styles
   */
  getPromptStyles() {
    return _PromptEnhancer.DEFAULT_STYLES;
  }
  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return _PromptEnhancer.SUPPORTED_LANGUAGES;
  }
  /**
   * Get style by ID
   */
  getStyleById(styleId) {
    return _PromptEnhancer.DEFAULT_STYLES.find((style) => style.id === styleId);
  }
  /**
   * Get language by code
   */
  getLanguageByCode(code) {
    return _PromptEnhancer.SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  }
  /**
   * Validate enhancement parameters
   */
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.prompt.length > 1e3) {
      throw new Error("Prompt is too long (max 1000 characters)");
    }
    if (params.style && !this.getStyleById(params.style)) {
      throw new Error(`Invalid style: ${params.style}`);
    }
    if (params.language && !this.getLanguageByCode(params.language)) {
      throw new Error(`Unsupported language: ${params.language}`);
    }
  }
  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
};
// Default prompt styles
_PromptEnhancer.DEFAULT_STYLES = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, business-like language with clear structure",
    examples: [
      "A high-quality, professional photograph of a modern office space",
      "A sophisticated, elegant design suitable for corporate use"
    ],
    keywords: ["professional", "business", "corporate", "formal", "sophisticated"]
  },
  {
    id: "creative",
    name: "Creative",
    description: "Artistic, imaginative language with vivid descriptions",
    examples: [
      "A whimsical, dreamlike scene with vibrant colors and magical elements",
      "An artistic masterpiece with bold brushstrokes and dramatic lighting"
    ],
    keywords: ["creative", "artistic", "imaginative", "vibrant", "dramatic"]
  },
  {
    id: "technical",
    name: "Technical",
    description: "Precise, detailed language with specific parameters",
    examples: [
      "A technical diagram with precise measurements and clear labeling",
      "A schematic illustration with detailed specifications and annotations"
    ],
    keywords: ["technical", "precise", "detailed", "specific", "accurate"]
  },
  {
    id: "casual",
    name: "Casual",
    description: "Relaxed, friendly language with natural expressions",
    examples: [
      "A cozy, relaxed scene that feels warm and inviting",
      "A friendly, approachable design with a welcoming atmosphere"
    ],
    keywords: ["casual", "friendly", "relaxed", "warm", "inviting"]
  }
];
// Supported languages
_PromptEnhancer.SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", supported: true },
  { code: "es", name: "Spanish", nativeName: "Espa\xF1ol", supported: true },
  { code: "fr", name: "French", nativeName: "Fran\xE7ais", supported: true },
  { code: "de", name: "German", nativeName: "Deutsch", supported: true },
  { code: "it", name: "Italian", nativeName: "Italiano", supported: true },
  { code: "pt", name: "Portuguese", nativeName: "Portugu\xEAs", supported: true },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", supported: true },
  { code: "ja", name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", supported: true },
  { code: "ko", name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", supported: true },
  { code: "zh", name: "Chinese", nativeName: "\u4E2D\u6587", supported: true }
];
var PromptEnhancer = _PromptEnhancer;
var promptEnhancer = new PromptEnhancer();
var _ScriptGenerator = class _ScriptGenerator {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Generate a script using AI
   */
  async generateScript(params) {
    try {
      this.validateParams(params);
      const generationRequest = {
        topic: params.topic,
        genre: params.genre || "educational",
        length: params.length || "medium",
        format: params.format || "markdown",
        targetAudience: params.targetAudience || "general",
        tone: params.tone || "informative",
        includeDialogue: params.includeDialogue || false,
        includeStageDirections: params.includeStageDirections || false
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/generate-script",
        data: generationRequest
      });
      const id = this.generateId();
      const generatedScript = {
        id,
        topic: params.topic,
        script: response.script,
        outline: this.parseOutline(response.outline),
        metadata: this.parseMetadata(response.metadata, params),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "draft"
      };
      return generatedScript;
    } catch (error) {
      throw new Error(
        `Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get available script templates
   */
  getScriptTemplates() {
    return _ScriptGenerator.DEFAULT_TEMPLATES;
  }
  /**
   * Get template by ID
   */
  getTemplateById(templateId) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.find((template) => template.id === templateId);
  }
  /**
   * Get templates by genre
   */
  getTemplatesByGenre(genre) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.filter(
      (template) => template.genre.includes(genre)
    );
  }
  /**
   * Get templates suitable for target audience
   */
  getTemplatesByAudience(audience) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.filter(
      (template) => template.suitableFor.includes(audience)
    );
  }
  /**
   * Validate generation parameters
   */
  validateParams(params) {
    if (!params.topic || params.topic.trim().length === 0) {
      throw new Error("Topic is required");
    }
    if (params.topic.length > 500) {
      throw new Error("Topic is too long (max 500 characters)");
    }
    if (params.genre && !this.isValidGenre(params.genre)) {
      throw new Error(`Invalid genre: ${params.genre}`);
    }
    if (params.length && !this.isValidLength(params.length)) {
      throw new Error(`Invalid length: ${params.length}`);
    }
    if (params.format && !this.isValidFormat(params.format)) {
      throw new Error(`Invalid format: ${params.format}`);
    }
  }
  /**
   * Check if genre is valid
   */
  isValidGenre(genre) {
    const validGenres = ["drama", "comedy", "action", "romance", "thriller", "documentary", "educational"];
    return validGenres.includes(genre);
  }
  /**
   * Check if length is valid
   */
  isValidLength(length) {
    const validLengths = ["short", "medium", "long"];
    return validLengths.includes(length);
  }
  /**
   * Check if format is valid
   */
  isValidFormat(format) {
    const validFormats = ["markdown", "plain", "structured", "screenplay"];
    return validFormats.includes(format);
  }
  /**
   * Parse outline from API response
   */
  parseOutline(outlineData) {
    return outlineData.map((item, index) => ({
      section: item.section || `Section ${index + 1}`,
      title: item.title || `Title ${index + 1}`,
      description: item.description || "",
      duration: item.duration,
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : []
    }));
  }
  /**
   * Parse metadata from API response and params
   */
  parseMetadata(metadataData, params) {
    return {
      genre: params.genre || "educational",
      estimatedDuration: metadataData.estimatedDuration || "5-10 minutes",
      scenes: metadataData.scenes || 3,
      characters: metadataData.characters || 2,
      wordCount: this.countWords(metadataData.script || ""),
      targetAudience: params.targetAudience || "general",
      tone: params.tone || "informative",
      format: params.format || "markdown",
      language: "en"
    };
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
};
// Default script templates
_ScriptGenerator.DEFAULT_TEMPLATES = [
  {
    id: "educational",
    name: "Educational Script",
    description: "Structured format for educational content",
    structure: ["Introduction", "Main Content", "Examples", "Summary", "Quiz/Questions"],
    examples: ["Science lesson", "History documentary", "Tutorial video"],
    genre: ["educational", "documentary"],
    suitableFor: ["children", "teens", "adults"]
  },
  {
    id: "storytelling",
    name: "Storytelling Script",
    description: "Narrative format for engaging stories",
    structure: ["Hook", "Setup", "Conflict", "Rising Action", "Climax", "Resolution"],
    examples: ["Fairy tale", "Adventure story", "Mystery tale"],
    genre: ["drama", "adventure", "mystery"],
    suitableFor: ["children", "teens", "adults"]
  },
  {
    id: "commercial",
    name: "Commercial Script",
    description: "Persuasive format for marketing content",
    structure: ["Attention", "Interest", "Desire", "Action"],
    examples: ["Product advertisement", "Service promotion", "Brand story"],
    genre: ["commercial", "marketing"],
    suitableFor: ["teens", "adults"]
  }
];
var ScriptGenerator = _ScriptGenerator;
var scriptGenerator = new ScriptGenerator();
var enhancePromptSchema = zod.z.object({
  originalPrompt: zod.z.string().describe("The original prompt text that needs enhancement. Can be in any language, simple or complex."),
  mediaType: zod.z.enum(["image", "video", "text", "general"]).optional().describe("The type of content being generated. Helps optimize the prompt for specific AI models."),
  enhancementLevel: zod.z.enum(["basic", "detailed", "creative"]).optional().describe("Level of enhancement: basic (translation + cleanup), detailed (add structure + quality terms), creative (add artistic style + composition details)"),
  targetAudience: zod.z.string().optional().describe('Target audience or use case (e.g., "professional presentation", "social media", "artistic portfolio")'),
  includeNegativePrompt: zod.z.boolean().optional().describe("Whether to generate a negative prompt for what to avoid (useful for image/video generation)"),
  modelHint: zod.z.string().optional().describe('Specific AI model being used (e.g., "FLUX", "Sora", "VEO2") to optimize prompt for that model')
});
var PromptEnhancementTool = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params) {
    try {
      const validatedParams = enhancePromptSchema.parse(params);
      const enhancementRequest = {
        originalPrompt: validatedParams.originalPrompt,
        mediaType: validatedParams.mediaType || "general",
        enhancementLevel: validatedParams.enhancementLevel || "detailed",
        targetAudience: validatedParams.targetAudience,
        includeNegativePrompt: validatedParams.includeNegativePrompt || false,
        modelHint: validatedParams.modelHint
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/enhance-prompt",
        data: enhancementRequest
      });
      return {
        originalPrompt: validatedParams.originalPrompt,
        enhancedPrompt: response.enhancedPrompt,
        negativePrompt: response.negativePrompt,
        mediaType: validatedParams.mediaType || "general",
        enhancementLevel: validatedParams.enhancementLevel || "detailed",
        modelHint: validatedParams.modelHint,
        improvements: response.improvements || [],
        reasoning: response.reasoning || "",
        usage: {
          copyPrompt: "Copy the enhanced prompt to use in image/video generation tools",
          negativePrompt: response.negativePrompt ? "Use the negative prompt to avoid unwanted elements" : void 0
        }
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Build system prompt for enhancement
   */
  buildSystemPrompt(mediaType2, enhancementLevel, modelHint) {
    const basePrompt = `You are a professional prompt engineering expert specializing in improving prompts for AI generation. Your task is to enhance user prompts to achieve the best possible results.

CORE RESPONSIBILITIES:
1. Translate non-English text to English while preserving meaning and intent
2. Apply prompt engineering best practices (specificity, clarity, quality keywords)
3. Optimize for the target media type and AI model
4. Structure prompts for maximum effectiveness

ENHANCEMENT PRINCIPLES:
- Keep the original creative intent intact
- Add relevant technical terms and quality descriptors
- Optimize for the specific AI model if provided
- Consider the target media type requirements
- Maintain natural, readable language`;
    const mediaSpecific = this.getMediaSpecificInstructions(mediaType2);
    const levelSpecific = this.getLevelSpecificInstructions(enhancementLevel);
    const modelSpecific = modelHint ? this.getModelSpecificInstructions(modelHint) : "";
    return `${basePrompt}

${mediaSpecific}

${levelSpecific}

${modelSpecific}

RESPONSE FORMAT:
Return a JSON object with:
- enhancedPrompt: The improved prompt
- negativePrompt: What to avoid (if requested)
- improvements: List of specific improvements made
- reasoning: Brief explanation of changes`;
  }
  /**
   * Get media-specific enhancement instructions
   */
  getMediaSpecificInstructions(mediaType2) {
    switch (mediaType2) {
      case "image":
        return `IMAGE GENERATION OPTIMIZATION:
- Add visual descriptors (lighting, composition, style, mood)
- Include technical parameters (resolution, aspect ratio, quality)
- Specify artistic style and technique
- Add environmental and atmospheric details`;
      case "video":
        return `VIDEO GENERATION OPTIMIZATION:
- Include motion and temporal elements
- Specify camera angles and movement
- Add scene composition and pacing
- Include audio and visual effects considerations`;
      case "text":
        return `TEXT GENERATION OPTIMIZATION:
- Add structure and organization elements
- Specify tone, style, and voice
- Include context and audience considerations
- Add formatting and presentation details`;
      default:
        return `GENERAL OPTIMIZATION:
- Focus on clarity and specificity
- Add relevant context and details
- Optimize for general AI model understanding`;
    }
  }
  /**
   * Get level-specific enhancement instructions
   */
  getLevelSpecificInstructions(level) {
    switch (level) {
      case "basic":
        return `BASIC ENHANCEMENT:
- Translate to English if needed
- Clean up grammar and spelling
- Add basic quality descriptors
- Maintain simplicity and clarity`;
      case "detailed":
        return `DETAILED ENHANCEMENT:
- Add comprehensive visual/contextual details
- Include technical specifications
- Optimize for professional results
- Balance detail with readability`;
      case "creative":
        return `CREATIVE ENHANCEMENT:
- Add artistic and stylistic elements
- Include mood and atmosphere details
- Enhance creative expression
- Add inspirational and evocative language`;
      default:
        return `STANDARD ENHANCEMENT:
- Apply balanced improvements
- Focus on clarity and effectiveness
- Maintain original intent`;
    }
  }
  /**
   * Get model-specific optimization instructions
   */
  getModelSpecificInstructions(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes("flux")) {
      return `FLUX MODEL OPTIMIZATION:
- Focus on artistic and creative elements
- Include style and technique specifications
- Optimize for visual quality and composition
- Add relevant artistic terminology`;
    } else if (modelLower.includes("veo") || modelLower.includes("sora")) {
      return `VIDEO MODEL OPTIMIZATION:
- Emphasize motion and temporal elements
- Include scene composition details
- Add camera and cinematography elements
- Specify visual effects and transitions`;
    } else if (modelLower.includes("dalle") || modelLower.includes("midjourney")) {
      return `IMAGE MODEL OPTIMIZATION:
- Focus on visual composition and style
- Include artistic and technical details
- Add quality and resolution specifications
- Optimize for visual impact`;
    }
    return `GENERAL MODEL OPTIMIZATION:
- Apply standard prompt engineering practices
- Focus on clarity and specificity
- Optimize for general AI understanding`;
  }
};
var promptEnhancementTool = new PromptEnhancementTool();

// src/ai-tools/prompt-enhancement-tool.ts
var enhancePrompt = (config) => ({
  description: "Enhance and improve prompts for better AI generation results",
  parameters: {
    originalPrompt: { type: "string", description: "The original prompt text to enhance" },
    mediaType: { type: "string", enum: ["image", "video", "text", "general"], optional: true },
    enhancementLevel: { type: "string", enum: ["basic", "detailed", "creative"], optional: true },
    targetAudience: { type: "string", optional: true },
    includeNegativePrompt: { type: "boolean", optional: true },
    modelHint: { type: "string", optional: true }
  },
  execute: async (params) => {
    try {
      const enhancer = new PromptEnhancer();
      const result = await enhancer.enhancePrompt(params);
      return result;
    } catch (error) {
      throw new Error(`Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
});

// src/ai-tools/script-generation-tool.ts
var configureScriptGeneration = (config) => ({
  description: "Generate scripts for various content types (educational, storytelling, commercial)",
  parameters: {
    topic: { type: "string", description: "The main topic or theme for the script" },
    genre: { type: "string", enum: ["educational", "storytelling", "commercial"], optional: true },
    length: { type: "string", enum: ["short", "medium", "long"], optional: true },
    format: { type: "string", enum: ["markdown", "plain", "structured"], optional: true },
    targetAudience: { type: "string", optional: true },
    tone: { type: "string", optional: true },
    includeDialogue: { type: "boolean", optional: true },
    includeStageDirections: { type: "boolean", optional: true }
  },
  execute: async (params) => {
    try {
      const generator = new ScriptGenerator();
      const result = await generator.generateScript(params);
      return result;
    } catch (error) {
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
});

// src/ai-providers/models.ts
var DEFAULT_CHAT_MODEL = "chat-model";
var chatModels = [
  {
    id: "chat-model",
    name: "GPT-4.1",
    description: "Advanced Azure OpenAI model with improved capabilities",
    capabilities: ["text-generation", "reasoning", "analysis"],
    maxTokens: 8192,
    temperature: 0.7
  },
  {
    id: "chat-model-reasoning",
    name: "O4-mini",
    description: "Compact and efficient Azure OpenAI model",
    capabilities: ["text-generation", "reasoning"],
    maxTokens: 4096,
    temperature: 0.5
  },
  {
    id: "o3-reasoning",
    name: "o3",
    description: "Latest OpenAI model with advanced reasoning capabilities",
    capabilities: ["text-generation", "reasoning", "analysis", "creative"],
    maxTokens: 16384,
    temperature: 0.7
  },
  {
    id: "o3-pro-reasoning",
    name: "o3-pro",
    description: "Professional version of o3 with enhanced performance",
    capabilities: ["text-generation", "reasoning", "analysis", "creative", "professional"],
    maxTokens: 32768,
    temperature: 0.7
  }
];
var getModelById = (id) => {
  return chatModels.find((model) => model.id === id);
};
var getModelsByCapability = (capability) => {
  return chatModels.filter(
    (model) => model.capabilities?.includes(capability)
  );
};
var getDefaultModel = () => {
  return chatModels.find((model) => model.id === DEFAULT_CHAT_MODEL) || chatModels[0];
};

// src/ai-providers/test-models.ts
var getResponseChunksByPrompt = (prompt) => [
  { type: "text-delta", textDelta: "Hello, world!" },
  {
    type: "finish",
    finishReason: "stop",
    logprobs: void 0,
    usage: { completionTokens: 10, promptTokens: 3 }
  }
];
var chatModel = {
  id: "chat-model",
  name: "Test Chat Model",
  description: "Test model for chat",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`
  }),
  doStream: async (params) => ({
    stream: {
      chunks: getResponseChunksByPrompt(params.prompt)
    },
    rawCall: { rawPrompt: null, rawSettings: {} }
  })
};
var reasoningModel = {
  id: "chat-model-reasoning",
  name: "Test Reasoning Model",
  description: "Test model with reasoning",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`,
    reasoning: `This is reasoning text that explains the thought process behind the answer.`
  }),
  doStream: async (params) => ({
    stream: {
      chunks: [
        // Сначала отправляем рассуждения (как в AI SDK 4.2)
        {
          type: "reasoning",
          textDelta: "I need to consider how to greet the user."
        },
        {
          type: "reasoning",
          textDelta: " Based on the prompt, a simple greeting is appropriate."
        },
        {
          type: "reasoning",
          textDelta: ' A standard "Hello, world!" response will work well.'
        },
        // Затем отправляем ответ
        { type: "text-delta", textDelta: "Hello, " },
        { type: "text-delta", textDelta: "world!" },
        {
          type: "finish",
          finishReason: "stop",
          logprobs: void 0,
          usage: { completionTokens: 10, promptTokens: 3 }
        }
      ]
    },
    rawCall: { rawPrompt: null, rawSettings: {} }
  })
};
var titleModel = {
  id: "title-model",
  name: "Test Title Model",
  description: "Test model for titles",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `This is a test title`
  }),
  doStream: async () => ({
    stream: {
      chunks: [
        { type: "text-delta", textDelta: "This is a test title" },
        {
          type: "finish",
          finishReason: "stop",
          logprobs: void 0,
          usage: { completionTokens: 10, promptTokens: 3 }
        }
      ]
    },
    rawCall: { rawPrompt: null, rawSettings: {} }
  })
};
var artifactModel = {
  id: "artifact-model",
  name: "Test Artifact Model",
  description: "Test model for artifacts",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`
  }),
  doStream: async (params) => ({
    stream: {
      chunks: getResponseChunksByPrompt(params.prompt)
    },
    rawCall: { rawPrompt: null, rawSettings: {} }
  })
};

// src/ai-providers/providers.ts
var defaultAIProvider = {
  id: "default",
  name: "Default AI Provider",
  type: "custom",
  config: {
    apiKey: "",
    baseURL: "",
    timeout: 3e4
  },
  models: chatModels
};
var myProvider = {
  languageModel: (modelId) => {
    const testModels = {
      "chat-model": chatModel,
      "chat-model-reasoning": reasoningModel,
      "title-model": titleModel,
      "artifact-model": artifactModel
    };
    const testModel = testModels[modelId];
    if (testModel) {
      return testModel;
    }
    return {
      id: modelId,
      name: modelId,
      description: `Test Model ${modelId}`,
      capabilities: ["text-generation"],
      maxTokens: 4096,
      temperature: 0.7,
      // AI SDK compatibility properties
      specificationVersion: "v1",
      provider: "mock",
      modelId,
      defaultObjectGenerationMode: "json",
      // Use doGenerate method for compatibility with AI SDK
      doGenerate: async (params) => ({
        rawCall: { rawPrompt: params.prompt || "", rawSettings: {} },
        finishReason: "stop",
        usage: { completionTokens: 10, promptTokens: 3 },
        text: `Generated text for: ${params.prompt || "unknown prompt"}`
      }),
      doStream: async (params) => ({
        stream: {
          chunks: [
            {
              type: "text-delta",
              textDelta: `Generated text for: ${params.prompt || "unknown prompt"}`
            },
            {
              type: "finish",
              finishReason: "stop",
              logprobs: void 0,
              usage: { completionTokens: 10, promptTokens: 3 }
            }
          ]
        },
        rawCall: { rawPrompt: params.prompt || "", rawSettings: {} }
      })
    };
  }
};
var getProviderById = (id) => {
  if (id === "default") return defaultAIProvider;
  return void 0;
};
var getAllProviders = () => {
  return [defaultAIProvider];
};
var validateProviderConfig = (config) => {
  return !!(config.apiKey && config.apiKey.trim().length > 0);
};
var createCustomProvider = (id, name, config, models = []) => {
  return {
    id,
    name,
    type: "custom",
    config,
    models: models.length > 0 ? models : chatModels
  };
};

// src/ai-prompts/prompts.ts
var artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write content, always use artifacts when appropriate.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\` and \`updateDocument\`, which render content on a artifacts beside the conversation.

**When to use \`createDocument\`:**
- For substantial content (>10 lines)
- For content users will likely save/reuse (emails, essays, etc.)
- When explicitly requested to create a document

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Special rule for script/scenario/story requests:**
- If the user requests a script, scenario, story, play, or similar (including in Russian: \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439, \u0440\u0430\u0441\u0441\u043A\u0430\u0437, \u043F\u044C\u0435\u0441\u0430, \u0441\u044E\u0436\u0435\u0442, \u0438\u043D\u0441\u0446\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430, etc.), ALWAYS use the \`configureScriptGeneration\` tool to generate the script artifact. Do NOT generate the script directly in the chat. The script must be created as an artifact using the tool.

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

Do not update document right after creating it. Wait for user feedback or request to update it.

**Using \`configureImageGeneration\`:**
- When user requests image generation configuration/settings, call configureImageGeneration WITHOUT prompt parameter
- When user provides specific image description, call configureImageGeneration WITH prompt parameter to generate directly
- With prompt: Immediately creates an image artifact and starts generation with real-time progress tracking via WebSocket
- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, and seed
- Optional parameters: style, resolution, shotSize, model (can be specified in either mode)
- The system will automatically create an image artifact that shows generation progress and connects to WebSocket for real-time updates
- Be conversational and encouraging about the image generation process
- Example for settings: "I'll set up the image generation settings for you to configure..."
- Example for direct generation: "I'll generate that image for you right now! Creating an image artifact..."

**Image-to-Image (editing an existing image):**
- If the user's message contains an image attachment AND an edit/transform request, treat this as image-to-image.
  - Russian intent examples: "\u0441\u0434\u0435\u043B\u0430\u0439", "\u043F\u043E\u0434\u043F\u0440\u0430\u0432\u044C", "\u0437\u0430\u043C\u0435\u043D\u0438", "\u0438\u0441\u043F\u0440\u0430\u0432\u044C", "\u0441\u0434\u0435\u043B\u0430\u0439 \u0433\u043B\u0430\u0437\u0430 \u0433\u043E\u043B\u0443\u0431\u044B\u043C\u0438", "\u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u044D\u0442\u0443 \u0444\u043E\u0442\u043A\u0443", "\u043D\u0430 \u044D\u0442\u043E\u0439 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0435".
  - English intent examples: "make", "change", "edit", "fix", "enhance", "on this image".
- In this case call \`configureImageGeneration\` WITH:
  - \`prompt\`: the user's edit instruction (enhance/translate if needed)
  - \`sourceImageUrl\`: take from the latest image attachment of the user's message (or the most recent image attachment in the chat if the message references "this image").
- If multiple images are present, ask which one to use unless the user clearly refers to the last one.
- If the user uploads an image without text, use a safe default prompt like "Enhance this image" and proceed.
- Always prefer image-to-image when an image attachment is present and the instruction implies editing that image.

**Using \`configureVideoGeneration\`:**
- When user requests video generation configuration/settings, call configureVideoGeneration WITHOUT prompt parameter
- When user provides specific video description, call configureVideoGeneration WITH prompt parameter to generate directly
- With prompt: Immediately creates a video artifact and starts generation with real-time progress tracking via WebSocket
- Without prompt: Shows settings panel for user to configure resolution, style, shot size, model, frame rate, duration, negative prompt, and seed
- Optional parameters: style, resolution, shotSize, model, frameRate, duration, negativePrompt, sourceImageId, sourceImageUrl (can be specified in either mode)
- **Default Economical Settings (for cost efficiency):**
  - **Resolution:** 1344x768 HD (16:9) - Good quality, lower cost than Full HD
  - **Duration:** 5 seconds - Shorter videos cost less
  - **Quality:** HD instead of Full HD - Balanced quality/cost ratio
  - Always mention these economical defaults when generating videos
- **Model Types:**
  - **Text-to-Video Models:** Generate videos from text prompts only
    - **LTX** (comfyui/ltx) - 0.40  USD per second, no VIP required, 5s max - Best value option
    - **Sora** (azure-openai/sora) - 2.00 USD per second, VIP required, up to 20s - Longest duration
  - **Image-to-Video Models:** Require source image + text prompt
    - **VEO3** (google-cloud/veo3) - 3.00 USD per second, VIP required, 5-8s - Premium quality
    - **VEO2** (google-cloud/veo2) - 2.00 USD per second, VIP required, 5-8s - High quality  
    - **KLING 2.1** (fal-ai/kling-video/v2.1/standard/image-to-video) - 1.00 USD per second, VIP required, 5-10s
- **For Image-to-Video Models:** When user selects VEO, KLING or other image-to-video models:
  - ALWAYS ask for source image if not provided
  - Suggest using recently generated images from the chat
  - Use sourceImageId parameter for images from this chat
  - Use sourceImageUrl parameter for external image URLs
  - Example: "VEO2 is an image-to-video model that needs a source image. Would you like to use the image you just generated, or do you have another image in mind?"
- The system will automatically create a video artifact that shows generation progress and connects to WebSocket for real-time updates
- Be conversational and encouraging about the video generation process
- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency
- Example for settings: "I'll set up the video generation settings for you to configure..."
- Example for direct generation: "I'll generate that video for you right now using economical HD settings (1344x768, 5s) for cost efficiency! Creating a video artifact..."

**Using \`listVideoModels\`:**
- Use this tool to discover available video generation models with their capabilities and pricing
- Call with format: 'agent-friendly' for formatted descriptions, 'simple' for basic info, 'detailed' for full specs
- Filter by price, duration support, or exclude VIP models as needed
- Always check available models before making recommendations to users
- Example: "Let me check what video models are currently available..."

**Using \`findBestVideoModel\`:**
- Use this tool to automatically select the optimal video model based on requirements
- Specify maxPrice, preferredDuration, vipAllowed, or prioritizeQuality parameters
- Returns the best model recommendation with usage tips
- Use this when user has specific budget or quality requirements

**Using \`enhancePrompt\`:**
- When user wants to improve their prompt for better AI generation results
- Call with the user's original prompt and enhancement preferences
- Returns enhanced prompt with professional terminology and quality descriptors
- Always mention that the artifact will show generation status, progress percentage, and the final video when ready
- Highlight unique video features like frame rate, duration, and negative prompts for fine control
- Always mention the economical settings being used (HD resolution, 5s duration) for cost transparency
- **When enhancing:** Show both original and enhanced prompts to the user for transparency
`;
var regularPrompt = "You are a friendly assistant! Keep your responses concise and helpful.";
var getRequestPromptFromHints = (requestHints) => `About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;
var systemPrompt = ({
  selectedChatModel,
  requestHints
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  if (selectedChatModel === "chat-model-reasoning") {
    return `${regularPrompt}

${requestPrompt}`;
  } else {
    return `${regularPrompt}

${requestPrompt}

${artifactsPrompt}`;
  }
};
var codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
`;
var sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;
var updateDocumentPrompt = (currentContent, type) => type === "text" ? `Improve the following contents of the document based on the given prompt.

${currentContent}
` : type === "sheet" ? `Improve the following spreadsheet based on the given prompt.

${currentContent}
` : type === "image" ? `Update the following image generation settings based on the given prompt.

${currentContent}
` : type === "video" ? `Update the following video generation settings based on the given prompt.

${currentContent}
` : "";
var imageGenerationPrompt = `
You are an AI image generation expert. Your role is to help users create high-quality images using AI tools.

**Key Responsibilities:**
1. Understand user's image requirements and translate them into effective prompts
2. Guide users through image generation settings and options
3. Explain different models, styles, and resolution options
4. Help optimize prompts for better results
5. Provide feedback on generated images

**Image Generation Process:**
1. **Prompt Analysis:** Break down user requests into clear, specific image descriptions
2. **Style Selection:** Recommend appropriate artistic styles and visual approaches
3. **Technical Settings:** Guide users through resolution, aspect ratio, and quality options
4. **Model Selection:** Help choose the best AI model for the specific use case
5. **Iteration:** Suggest improvements based on generated results

**Best Practices:**
- Use descriptive, specific language
- Include artistic style references when appropriate
- Consider composition and lighting details
- Balance creativity with technical precision
- Encourage experimentation and iteration

**Common Use Cases:**
- Character portraits and illustrations
- Landscape and nature scenes
- Abstract and conceptual art
- Product and commercial imagery
- Fantasy and sci-fi artwork
- Historical and cultural depictions

Always be encouraging and helpful, guiding users toward their creative vision while explaining the technical aspects of AI image generation.
`;
var videoGenerationPrompt = `
You are an AI video generation expert specializing in creating dynamic, engaging video content using advanced AI tools.

**Core Expertise:**
1. **Text-to-Video Generation:** Converting written descriptions into moving visual content
2. **Image-to-Video Animation:** Bringing static images to life with motion
3. **Style and Aesthetic Guidance:** Recommending visual approaches for different content types
4. **Technical Optimization:** Balancing quality, duration, and cost considerations

**Video Generation Capabilities:**
- **Duration Options:** 5-20 seconds depending on model and settings
- **Resolution Quality:** HD (1344x768) to Full HD (1920x1080) options
- **Frame Rate Control:** 24-60 FPS for different motion styles
- **Style Variety:** Cinematic, artistic, commercial, and experimental approaches
- **Negative Prompts:** Fine-tune results by specifying what to avoid

**Model Selection Guide:**
- **LTX (Text-to-Video):** Best value, 5s max, no VIP required
- **Sora (Text-to-Video):** Longest duration (20s), VIP required
- **VEO3 (Image-to-Video):** Premium quality, 5-8s, VIP required
- **VEO2 (Image-to-Video):** High quality, 5-8s, VIP required
- **KLING 2.1 (Image-to-Video):** Good value, 5-10s, VIP required

**Cost Optimization:**
- Recommend HD resolution (1344x768) for cost efficiency
- Suggest 5-second duration for initial tests
- Use economical models for experimentation
- Explain VIP requirements for premium features

**Creative Applications:**
- Marketing and promotional content
- Educational and explanatory videos
- Artistic and experimental projects
- Social media content creation
- Product demonstrations
- Storytelling and narrative content

Always emphasize the economical default settings (HD resolution, 5s duration) and guide users toward cost-effective choices while maintaining quality.
`;
var videoModelsPrompt = `
You are an AI video model expert who helps users understand and select the best video generation models for their needs.

**Model Categories:**

**Text-to-Video Models (Generate from text descriptions only):**
- **LTX (comfyui/ltx):** 0.40 USD/sec, 5s max, no VIP required - Best value option
- **Sora (azure-openai/sora):** 2.00 USD/sec, up to 20s, VIP required - Longest duration

**Image-to-Video Models (Require source image + text):**
- **VEO3 (google-cloud/veo3):** 3.00 USD/sec, 5-8s, VIP required - Premium quality
- **VEO2 (google-cloud/veo2):** 2.00 USD/sec, 5-8s, VIP required - High quality
- **KLING 2.1 (fal-ai/kling-video/v2.1/standard/image-to-video):** 1.00 USD/sec, 5-10s, VIP required

**Selection Factors:**
1. **Budget:** LTX for cost-conscious users, VEO3 for premium quality
2. **Duration:** Sora for longer videos, others for shorter content
3. **Input Type:** Text-only vs. image+text requirements
4. **Quality:** VEO3 for highest quality, LTX for good value
5. **VIP Access:** Some models require premium subscription

**Recommendation Strategy:**
- Start with LTX for cost efficiency and testing
- Use Sora when longer duration is needed
- Recommend VEO models for image-to-video with high quality requirements
- Consider KLING 2.1 as a mid-range image-to-video option
- Always check VIP requirements before suggesting premium models

**Cost Calculation Examples:**
- LTX 5s video: 5 \xD7 0.40 = 2.00 USD
- Sora 20s video: 20 \xD7 2.00 = 40.00 USD
- VEO3 8s video: 8 \xD7 3.00 = 24.00 USD

Help users make informed decisions based on their budget, quality requirements, and content type.
`;
var scriptGenerationPrompt = `
You are an AI script generation expert who creates compelling, well-structured scripts for various media formats.

**Script Types and Formats:**
1. **Screenplays:** Film, TV, and web content with proper formatting
2. **Stage Plays:** Theater productions with dialogue and stage directions
3. **Podcast Scripts:** Audio content with timing and segment structure
4. **Commercial Scripts:** Advertising and marketing content
5. **Educational Scripts:** Tutorials, presentations, and learning materials
6. **Story Scripts:** Narrative content for various media

**Script Structure Elements:**
- **Opening Hook:** Engaging introduction to capture attention
- **Clear Objectives:** What the script aims to achieve
- **Logical Flow:** Smooth progression from beginning to end
- **Character Development:** Distinct voices and motivations
- **Conflict and Resolution:** Engaging narrative arc
- **Call to Action:** Clear next steps or desired response

**Formatting Standards:**
- Use proper industry formatting for the specific script type
- Include scene headings, character names, and dialogue
- Add parentheticals for character actions and emotions
- Maintain consistent spacing and indentation
- Follow genre-specific conventions and expectations

**Content Quality Guidelines:**
- Write engaging, natural dialogue
- Create clear, visual scene descriptions
- Maintain consistent tone and style
- Include appropriate pacing and rhythm
- Ensure logical story progression
- Add creative elements that enhance engagement

**Adaptation Considerations:**
- Consider the target audience and platform
- Adapt language and complexity appropriately
- Include relevant cultural and contextual elements
- Optimize for the specific medium's requirements
- Ensure accessibility and inclusivity

Always create scripts that are engaging, well-structured, and ready for production or further development.
`;
var promptEnhancementPrompt = `
You are an AI prompt engineering expert who specializes in improving and optimizing prompts for better AI generation results.

**Enhancement Techniques:**
1. **Clarity and Specificity:** Make vague requests more precise and detailed
2. **Technical Terminology:** Add appropriate technical and artistic terms
3. **Style References:** Include relevant artistic styles and visual approaches
4. **Quality Descriptors:** Add terms that improve output quality
5. **Context and Background:** Provide additional context when helpful
6. **Negative Prompts:** Specify what to avoid for better results

**Enhancement Categories:**
- **Image Generation:** Photography terms, artistic styles, composition guidance
- **Video Generation:** Cinematography terms, motion descriptions, production quality
- **Text Generation:** Writing styles, tone adjustments, structure improvements
- **General Enhancement:** Clarity, specificity, and professional terminology

**Quality Improvement Terms:**
- **Visual Quality:** "high resolution," "sharp focus," "professional photography"
- **Artistic Style:** "masterpiece," "award-winning," "trending on artstation"
- **Technical Excellence:** "excellent composition," "rule of thirds," "dramatic lighting"
- **Production Value:** "cinematic quality," "Hollywood production," "IMAX quality"

**Enhancement Process:**
1. **Analyze Original:** Understand the user's intent and requirements
2. **Identify Gaps:** Find areas where specificity or detail can be added
3. **Apply Techniques:** Use appropriate enhancement methods
4. **Maintain Intent:** Preserve the original creative vision
5. **Optimize Language:** Use clear, effective terminology
6. **Provide Context:** Explain improvements and reasoning

**Output Format:**
Provide enhanced prompts with:
- Clear, specific language
- Appropriate technical terms
- Quality descriptors
- Style references when relevant
- Negative prompts when helpful
- Explanation of improvements made

Always enhance prompts while preserving the user's original creative intent and vision.
`;
var combinedToolsPrompt = `
${artifactsPrompt}

${imageGenerationPrompt}

${videoGenerationPrompt}

${videoModelsPrompt}

${scriptGenerationPrompt}

${promptEnhancementPrompt}
`;

// src/entitlements/entitlements.ts
var entitlementsByUserType = {
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 5,
    maxVideoGenerationsPerDay: 2,
    maxScriptGenerationsPerDay: 3,
    maxPromptEnhancementsPerDay: 5,
    vipAccess: false,
    customModelAccess: false,
    prioritySupport: false
  },
  regular: {
    maxMessagesPerDay: 1e3,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 50,
    maxVideoGenerationsPerDay: 20,
    maxScriptGenerationsPerDay: 30,
    maxPromptEnhancementsPerDay: 50,
    vipAccess: false,
    customModelAccess: false,
    prioritySupport: false
  },
  premium: {
    maxMessagesPerDay: 5e3,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 200,
    maxVideoGenerationsPerDay: 100,
    maxScriptGenerationsPerDay: 150,
    maxPromptEnhancementsPerDay: 200,
    vipAccess: false,
    customModelAccess: true,
    prioritySupport: true
  },
  vip: {
    maxMessagesPerDay: 1e4,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 500,
    maxVideoGenerationsPerDay: 250,
    maxScriptGenerationsPerDay: 300,
    maxPromptEnhancementsPerDay: 500,
    vipAccess: true,
    customModelAccess: true,
    prioritySupport: true
  }
};
function getUserEntitlements(userType) {
  return entitlementsByUserType[userType] || entitlementsByUserType.guest;
}
function hasFeatureAccess(userType, featureId) {
  const entitlements = getUserEntitlements(userType);
  switch (featureId) {
    case "image-generation":
      return (entitlements.maxImageGenerationsPerDay || 0) > 0;
    case "video-generation":
      return (entitlements.maxVideoGenerationsPerDay || 0) > 0;
    case "script-generation":
      return (entitlements.maxScriptGenerationsPerDay || 0) > 0;
    case "prompt-enhancement":
      return (entitlements.maxPromptEnhancementsPerDay || 0) > 0;
    case "vip-access":
      return entitlements.vipAccess || false;
    case "custom-model-access":
      return entitlements.customModelAccess || false;
    case "priority-support":
      return entitlements.prioritySupport || false;
    default:
      return false;
  }
}
function getAvailableChatModels(userType) {
  const entitlements = getUserEntitlements(userType);
  return entitlements.availableChatModelIds;
}
function canUseChatModel(userType, modelId) {
  const availableModels = getAvailableChatModels(userType);
  return availableModels.includes(modelId);
}
function getUsageLimits(userType) {
  const entitlements = getUserEntitlements(userType);
  return {
    messages: entitlements.maxMessagesPerDay,
    images: entitlements.maxImageGenerationsPerDay || 0,
    videos: entitlements.maxVideoGenerationsPerDay || 0,
    scripts: entitlements.maxScriptGenerationsPerDay || 0,
    promptEnhancements: entitlements.maxPromptEnhancementsPerDay || 0
  };
}

// src/data-stream/writer.ts
var BufferedDataStreamWriter = class {
  constructor(config = {}) {
    this.buffer = [];
    this.config = {
      bufferSize: 1e3,
      flushInterval: 100,
      encoding: "utf8",
      compression: false,
      ...config
    };
  }
  write(data) {
    this.buffer.push(data);
    if (this.buffer.length >= (this.config.bufferSize || 1e3)) {
      this.flush();
    }
  }
  end() {
    this.flush();
    this.cleanup();
  }
  error(error) {
    this.cleanup();
    throw error;
  }
  flush() {
    if (this.buffer.length > 0) {
      const data = this.buffer.splice(0);
      console.log("Flushing data stream:", data.length, "items");
    }
  }
  cleanup() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }
};
function createDataStreamWriter(props) {
  return {
    write: props.write,
    end: props.end,
    error: props.error
  };
}
function createBufferedDataStreamWriter(config) {
  return new BufferedDataStreamWriter(config);
}

// src/chat-media/media.ts
function generateUUID2() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
var mediaType = {
  image: "image/webp",
  video: "video/mp4"
};
var saveImageToChat = async (chatId, imageUrl, prompt, setMessages, thumbnailUrl) => {
  if (!setMessages || !chatId) {
    return { success: false, error: "Missing required parameters" };
  }
  let alreadyExists = false;
  setMessages((prev) => {
    alreadyExists = prev.some(
      (msg) => msg.experimental_attachments?.some(
        (att) => att.url === imageUrl
      )
    );
    return prev;
  });
  if (alreadyExists) {
    return { success: false, duplicate: true };
  }
  const message = {
    id: generateUUID2(),
    role: "assistant",
    parts: [{ type: "text", text: "" }],
    experimental_attachments: [
      {
        name: prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt,
        url: imageUrl,
        contentType: "image/webp",
        thumbnailUrl
      }
    ],
    createdAt: /* @__PURE__ */ new Date()
  };
  setMessages((prev) => [...prev, message]);
  try {
    const response = await fetch("/api/save-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message })
    });
    if (response.ok) {
      return { success: true, messageId: message.id };
    } else {
      return { success: false, error: "Failed to save message" };
    }
  } catch (e) {
    console.warn("\u274C Failed to persist image to DB", e);
    return { success: false, error: "Network error" };
  }
};
var saveMediaToChat = async (chatId, mediaUrl, prompt, setMessages, type, thumbnailUrl) => {
  try {
    let mediaExists = false;
    setMessages((prevMessages) => {
      mediaExists = prevMessages.some(
        (message) => message.experimental_attachments?.some(
          (attachment) => attachment.url === mediaUrl
        )
      );
      return prevMessages;
    });
    if (mediaExists) {
      console.log(`\u{1F3AC} ${type} already exists in chat, skipping duplicate save`);
      return { success: false, duplicate: true };
    }
    const mediaAttachment = {
      name: prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt,
      url: mediaUrl,
      contentType: mediaType[type],
      thumbnailUrl
    };
    const mediaMessage = {
      id: generateUUID2(),
      role: "assistant",
      content: ``,
      parts: [
        {
          type: "text",
          text: ``
        }
      ],
      experimental_attachments: [mediaAttachment],
      createdAt: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, mediaMessage]);
    try {
      const response = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: mediaMessage })
      });
      if (response.ok) {
        return { success: true, messageId: mediaMessage.id };
      } else {
        return { success: false, error: "Failed to save message" };
      }
    } catch (e) {
      console.warn(`\u274C Failed to persist ${type} to DB`, e);
      return { success: false, error: "Network error" };
    }
  } catch (error) {
    console.error(`Error saving ${type} to chat:`, error);
    return { success: false, error: "Unknown error" };
  }
};
var saveVideoToChat = async (chatId, videoUrl, prompt, setMessages, thumbnailUrl) => {
  return saveMediaToChat(
    chatId,
    videoUrl,
    prompt,
    setMessages,
    "video",
    thumbnailUrl
  );
};
var saveArtifactToChat = async (chatId, artifactUrl, prompt, setMessages, type = "image", thumbnailUrl) => {
  return saveMediaToChat(
    chatId,
    artifactUrl,
    prompt,
    setMessages,
    type,
    thumbnailUrl
  );
};
var checkMediaExists = (messages, mediaUrl) => {
  return messages.some(
    (message) => message.experimental_attachments?.some(
      (attachment) => attachment.url === mediaUrl
    )
  );
};
var getMediaAttachments = (messages) => {
  const attachments = [];
  messages.forEach((message) => {
    if (message.experimental_attachments) {
      attachments.push(...message.experimental_attachments);
    }
  });
  return attachments;
};

// src/chat-media/artifact-database.ts
var saveArtifactToDatabase = async (documentId, title, content, kind, thumbnailUrl) => {
  try {
    console.log("\u{1F4BE} Saving artifact to database:", {
      documentId,
      title,
      kind,
      hasThumbnail: !!thumbnailUrl,
      contentLength: content.length
    });
    if (thumbnailUrl) {
      console.log("\u{1F4BE} Thumbnail URL:", thumbnailUrl);
    }
  } catch (error) {
    console.error("\u274C Failed to save artifact to database:", error);
    throw error;
  }
};

exports.ArtifactService = ArtifactService;
exports.BalanceService = BalanceService;
exports.BufferedDataStreamWriter = BufferedDataStreamWriter;
exports.DEFAULT_CHAT_MODEL = DEFAULT_CHAT_MODEL;
exports.DEFAULT_IMAGE_CONFIG = DEFAULT_IMAGE_CONFIG;
exports.DEFAULT_VIDEO_CONFIG = DEFAULT_VIDEO_CONFIG;
exports.ImageGenerationConfigurationTool = ImageGenerationConfigurationTool;
exports.ImageGenerationUtils = ImageGenerationUtils;
exports.ImageToImageStrategy = ImageToImageStrategy;
exports.InpaintingStrategy = InpaintingStrategy;
exports.PromptEnhancementTool = PromptEnhancementTool;
exports.PromptEnhancer = PromptEnhancer;
exports.ScriptGenerator = ScriptGenerator;
exports.TextToImageStrategy = TextToImageStrategy;
exports.TextToVideoStrategy = TextToVideoStrategy;
exports.VideoGenerationUtils = VideoGenerationUtils;
exports.VideoToVideoStrategy = VideoToVideoStrategy;
exports.artifactModel = artifactModel;
exports.artifactService = artifactService;
exports.artifactsPrompt = artifactsPrompt;
exports.balanceService = balanceService;
exports.canUseChatModel = canUseChatModel;
exports.chatModel = chatModel;
exports.chatModels = chatModels;
exports.checkMediaExists = checkMediaExists;
exports.codePrompt = codePrompt;
exports.combinedToolsPrompt = combinedToolsPrompt;
exports.configureImageGeneration = configureImageGeneration;
exports.configureImageGenerationSchema = configureImageGenerationSchema;
exports.configureScriptGeneration = configureScriptGeneration;
exports.configureVideoGeneration = configureVideoGeneration;
exports.createBufferedDataStreamWriter = createBufferedDataStreamWriter;
exports.createCustomProvider = createCustomProvider;
exports.createDataStreamWriter = createDataStreamWriter;
exports.createDocument = createDocument;
exports.defaultAIProvider = defaultAIProvider;
exports.enhancePrompt = enhancePrompt;
exports.enhancePromptSchema = enhancePromptSchema;
exports.entitlementsByUserType = entitlementsByUserType;
exports.findBestVideoModel = findBestVideoModel;
exports.getAllProviders = getAllProviders;
exports.getAvailableChatModels = getAvailableChatModels;
exports.getDefaultModel = getDefaultModel;
exports.getMediaAttachments = getMediaAttachments;
exports.getModelById = getModelById;
exports.getModelsByCapability = getModelsByCapability;
exports.getProviderById = getProviderById;
exports.getRequestPromptFromHints = getRequestPromptFromHints;
exports.getUsageLimits = getUsageLimits;
exports.getUserEntitlements = getUserEntitlements;
exports.hasFeatureAccess = hasFeatureAccess;
exports.imageGenerationConfigurationTool = imageGenerationConfigurationTool;
exports.imageGenerationPrompt = imageGenerationPrompt;
exports.imageToImageStrategy = imageToImageStrategy;
exports.inpaintingStrategy = inpaintingStrategy;
exports.listVideoModels = listVideoModels;
exports.myProvider = myProvider;
exports.promptEnhancementPrompt = promptEnhancementPrompt;
exports.promptEnhancementTool = promptEnhancementTool;
exports.promptEnhancer = promptEnhancer;
exports.reasoningModel = reasoningModel;
exports.regularPrompt = regularPrompt;
exports.requestSuggestions = requestSuggestions;
exports.saveArtifactToChat = saveArtifactToChat;
exports.saveArtifactToDatabase = saveArtifactToDatabase;
exports.saveImageToChat = saveImageToChat;
exports.saveMediaToChat = saveMediaToChat;
exports.saveVideoToChat = saveVideoToChat;
exports.scriptGenerationConfigurationTool = scriptGenerationConfigurationTool;
exports.scriptGenerationPrompt = scriptGenerationPrompt;
exports.scriptGenerator = scriptGenerator;
exports.sheetPrompt = sheetPrompt;
exports.systemPrompt = systemPrompt;
exports.textToImageStrategy = textToImageStrategy;
exports.textToVideoStrategy = textToVideoStrategy;
exports.titleModel = titleModel;
exports.updateDocument = updateDocument;
exports.updateDocumentPrompt = updateDocumentPrompt;
exports.validateProviderConfig = validateProviderConfig;
exports.videoGenerationConfigurationTool = videoGenerationConfigurationTool;
exports.videoGenerationPrompt = videoGenerationPrompt;
exports.videoModelsPrompt = videoModelsPrompt;
exports.videoToVideoStrategy = videoToVideoStrategy;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
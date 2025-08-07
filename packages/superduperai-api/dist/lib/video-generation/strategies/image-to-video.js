// Simple snake_case converter
function snakeCase(str) {
    if (!str)
        return undefined;
    return str.trim().replace(/\s+/g, "_").toLowerCase();
}
// Helper function to extract string value from object or string
function getStringValue(value) {
    if (!value)
        return undefined;
    if (typeof value === "string")
        return value;
    if (typeof value === "object" && value.id)
        return value.id;
    if (typeof value === "object" && value.label)
        return value.label;
    return undefined;
}
// Simple resolution parser
function parseResolution(resolution) {
    if (typeof resolution === "string") {
        // Handle string format like "1920x1080" or "16:9"
        if (resolution.includes("x")) {
            const [width, height] = resolution.split("x").map(Number);
            return { width, height, aspectRatio: `${width}:${height}` };
        }
        else if (resolution.includes(":")) {
            const [width, height] = resolution.split(":").map(Number);
            return { width, height, aspectRatio: resolution };
        }
    }
    // Handle object format
    if (resolution && typeof resolution === "object") {
        const width = resolution.width || 1280;
        const height = resolution.height || 720;
        const aspectRatio = resolution.aspectRatio || "16:9";
        return { width, height, aspectRatio };
    }
    // Default values
    return { width: 1280, height: 720, aspectRatio: "16:9" };
}
export class ImageToVideoStrategy {
    constructor() {
        this.type = "image-to-video";
        this.requiresSourceImage = true;
        this.requiresPrompt = false; // Animation description is optional
    }
    validate(params) {
        if (!params.file) {
            return {
                valid: false,
                error: "Source image is required for image-to-video generation",
            };
        }
        return { valid: true };
    }
    /**
     * Handle image upload to SuperDuperAI
     */
    async handleImageUpload(params, config) {
        console.log("🔍 handleImageUpload called with:", {
            hasFile: !!params.file,
            fileType: params.file?.type,
            fileSize: params.file?.size,
            uploadUrl: `${config.url}/api/v1/file/upload`,
        });
        if (!params.file) {
            console.log("❌ No file provided for upload");
            return {
                error: "No file provided for upload",
                method: "upload",
            };
        }
        try {
            const formData = new FormData();
            formData.append("payload", params.file);
            formData.append("type", "image");
            console.log("📤 Sending upload request to:", `${config.url}/api/v1/file/upload`);
            const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.token}`,
                    "User-Agent": "SuperDuperAI-Landing/1.0",
                },
                body: formData,
            });
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`File upload failed: ${uploadResponse.status} - ${errorText}`);
            }
            const uploadResult = await uploadResponse.json();
            console.log("uploadResult", uploadResult);
            return {
                imageId: uploadResult?.id,
                imageUrl: uploadResult?.url || undefined,
                method: "upload",
            };
        }
        catch (error) {
            console.error("Error uploading file", error);
            return {
                error: "Image upload failed",
                method: "upload",
            };
        }
    }
    async generatePayload(params, config) {
        let imageId;
        console.log("🔍 ImageToVideoStrategy.generatePayload called with:", {
            hasConfig: !!config,
            hasFile: !!params.file,
            fileType: params.file?.type,
            fileSize: params.file?.size,
        });
        if (config) {
            console.log("📤 Starting image upload...");
            const uploadResult = await this.handleImageUpload(params, config);
            console.log("📤 Image upload result:", uploadResult);
            imageId = uploadResult.imageId;
        }
        else {
            console.log("⚠️ No config provided, skipping image upload");
        }
        const { width, height, aspectRatio } = parseResolution(params.resolution);
        const modelName = typeof params.model === "string"
            ? params.model
            : params.model?.name || "azure-openai/sora";
        const payload = {
            config: {
                prompt: params.prompt || "animate this image naturally", // Default for image-to-video
                generation_config_name: modelName,
                duration: params.duration,
                aspect_ratio: aspectRatio || "16:9",
                seed: params.seed || Math.floor(Math.random() * 1000000000000),
                negative_prompt: params.negativePrompt || "",
                width: width,
                height: height,
                frame_rate: params.frameRate,
                shot_size: snakeCase(getStringValue(params.shotSize)), // Extract string from object/string
                style_name: snakeCase(getStringValue(params.style)), // Extract string from object/string
                references: imageId
                    ? [
                        {
                            type: "source",
                            reference_id: imageId,
                        },
                    ]
                    : [],
            },
        };
        console.log("📦 Final payload references:", {
            imageId,
            references: payload.config.references,
            referencesLength: payload.config.references.length,
        });
        return payload;
    }
}
//# sourceMappingURL=image-to-video.js.map
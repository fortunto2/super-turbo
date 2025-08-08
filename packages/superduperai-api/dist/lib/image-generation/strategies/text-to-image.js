// Text-to-Image Strategy
export class TextToImageStrategy {
    constructor() {
        this.type = "text-to-image";
        this.requiresSourceImage = false;
        this.requiresPrompt = true;
    }
    validate(params) {
        if (!params.prompt?.trim()) {
            return {
                valid: false,
                error: "Prompt is required for text-to-image generation",
            };
        }
        return { valid: true };
    }
    async generatePayload(params) {
        const modelName = params.model?.name || "fal-ai/flux-dev";
        const isGPTImage = String(modelName).includes("gpt-image-1");
        if (isGPTImage) {
            // OpenAI GPT-Image-1: минимальный набор полей, без style_name/shot_size/batch_size
            return {
                config: {
                    prompt: params.prompt,
                    negative_prompt: params.negativePrompt || "",
                    width: params.resolution?.width || 1024,
                    height: params.resolution?.height || 1024,
                    seed: params.seed || Math.floor(Math.random() * 1000000000000),
                    generation_config_name: modelName,
                },
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
                seed: params.seed || Math.floor(Math.random() * 1000000000000),
                generation_config_name: modelName,
                // batch_size removed: only single image generation is supported
                style_name: params.style?.id || null,
                references: [],
                entity_ids: [],
            },
        };
    }
}
//# sourceMappingURL=text-to-image.js.map
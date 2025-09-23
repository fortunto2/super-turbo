import { type NextRequest, NextResponse } from "next/server";

// AICODE-NOTE: Простой MCP сервер для демонстрации работы инструментов
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "MCP Server is running",
    timestamp: new Date().toISOString(),
    tools: [
      "generate_image",
      "generate_video",
      "enhance_prompt",
      "generate_script",
      "get_available_models",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Обработка MCP запросов
    if (body.method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          tools: [
            {
              name: "generate_image",
              description: "Generate high-quality images using AI models",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description:
                      "Detailed description of the image to generate",
                  },
                  model: {
                    type: "string",
                    description: "AI model to use for generation",
                  },
                  resolution: {
                    type: "string",
                    description: "Image resolution (e.g., '1024x1024')",
                  },
                  style: {
                    type: "string",
                    description: "Art style for the image",
                  },
                  shotSize: { type: "string", description: "Camera shot size" },
                  seed: {
                    type: "number",
                    description: "Random seed for reproducible results",
                  },
                  generationType: {
                    type: "string",
                    enum: ["text-to-image", "image-to-image"],
                  },
                  sourceImageUrl: {
                    type: "string",
                    description:
                      "Source image URL for image-to-image generation",
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "generate_video",
              description:
                "Generate videos using AI models from text or images",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description:
                      "Detailed description of the video to generate",
                  },
                  model: {
                    type: "string",
                    description: "AI model to use for generation",
                  },
                  resolution: {
                    type: "string",
                    description: "Video resolution (e.g., '1280x720')",
                  },
                  style: { type: "string", description: "Video style" },
                  duration: {
                    type: "number",
                    description: "Video duration in seconds",
                  },
                  frameRate: {
                    type: "number",
                    description: "Frame rate (e.g., 30)",
                  },
                  generationType: {
                    type: "string",
                    enum: ["text-to-video", "image-to-video"],
                  },
                  sourceImageUrl: {
                    type: "string",
                    description:
                      "Source image URL for image-to-video generation",
                  },
                  negativePrompt: {
                    type: "string",
                    description: "What to avoid in the video",
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "enhance_prompt",
              description:
                "Enhance and improve prompts for better AI generation results",
              inputSchema: {
                type: "object",
                properties: {
                  originalPrompt: {
                    type: "string",
                    description: "The original prompt to enhance",
                  },
                  mediaType: {
                    type: "string",
                    enum: ["image", "video", "text", "general"],
                  },
                  enhancementLevel: {
                    type: "string",
                    enum: ["basic", "detailed", "creative"],
                  },
                  targetAudience: {
                    type: "string",
                    description: "Target audience for the content",
                  },
                  includeNegativePrompt: {
                    type: "boolean",
                    description:
                      "Whether to include negative prompt suggestions",
                  },
                  modelHint: {
                    type: "string",
                    description: "Hint about which AI model will be used",
                  },
                },
                required: ["originalPrompt"],
              },
            },
            {
              name: "generate_script",
              description:
                "Generate scripts for videos, presentations, or other content",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "Description of the script to generate",
                  },
                  scriptType: {
                    type: "string",
                    enum: [
                      "video",
                      "presentation",
                      "story",
                      "dialogue",
                      "narrative",
                    ],
                  },
                  length: { type: "string", enum: ["short", "medium", "long"] },
                  tone: {
                    type: "string",
                    enum: [
                      "formal",
                      "casual",
                      "professional",
                      "creative",
                      "educational",
                    ],
                  },
                  targetAudience: {
                    type: "string",
                    description: "Target audience for the script",
                  },
                  includeStructure: {
                    type: "boolean",
                    description: "Whether to include structural elements",
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "get_available_models",
              description:
                "Get list of available AI models for different generation types",
              inputSchema: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["image", "video", "text"] },
                },
              },
            },
          ],
        },
      });
    }

    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params;

      // Простая заглушка для тестирования
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [
            {
              type: "text",
              text: `✅ Tool '${name}' called successfully!\n\nParameters: ${JSON.stringify(args, null, 2)}\n\nNote: This is a test response. The actual tool implementation will be added once the server issues are resolved.`,
            },
          ],
        },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      error: {
        code: -32601,
        message: "Method not found",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 400 }
    );
  }
}

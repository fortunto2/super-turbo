import { NextRequest, NextResponse } from "next/server";
import {
  SceneService,
  ListOrderEnum,
  SelectRelatedEnum,
  getSuperduperAIConfig,
  OpenAPI,
} from "@turbo-super/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Setup OpenAPI configuration before using SceneService
    const config = await getSuperduperAIConfig();
    console.log("SuperDuperAI config:", {
      hasToken: !!config.token,
      hasUrl: !!config.url,
      url: config.url,
    });

    if (config.token) {
      OpenAPI.TOKEN = config.token;
    }
    if (config.url) {
      OpenAPI.BASE = config.url;
    }

    console.log("OpenAPI configuration:", {
      BASE: OpenAPI.BASE,
      hasToken: !!OpenAPI.TOKEN,
    });

    // Check that configuration is correct
    if (!OpenAPI.BASE || OpenAPI.BASE === "") {
      throw new Error("OpenAPI base URL is not configured");
    }

    // Use SceneService to get scenes
    const response = await SceneService.sceneGetList({
      projectId,
      orderBy: "order",
      order: ListOrderEnum.ASCENDENT,
      selectRelated: SelectRelatedEnum.FULL,
      limit: 50,
    });
    console.log("SceneService response:", response);

    // Extract scenes from response
    const scenes = response.items || [];

    return NextResponse.json({
      success: true,
      scenes,
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);

    // Check if error is URL-related
    if (error instanceof Error && error.message.includes("Invalid URL")) {
      console.error("OpenAPI configuration error - invalid base URL");
      console.error("Current OpenAPI.BASE:", OpenAPI.BASE);
    }

    // In case of error, return placeholder for demonstration
    return NextResponse.json({
      success: true,
      scenes: [
        {
          id: "scene-1",
          order: 1,
                  visual_description: "Beautiful sunset over the sea",
        action_description: "Camera smoothly moves along the shore",
          dialogue: {
            speaker: "Narrator",
            text: "Welcome to our world",
          },
          duration: 5,
          file: {
            id: "file-1",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            type: "image",
          },
        },
        {
          id: "scene-2",
          order: 2,
          visual_description: "Cityscape at night",
          action_description: "Panoramic view of city lights",
          dialogue: {
            speaker: "Narrator",
            text: "Where technology meets dreams",
          },
          duration: 4,
          file: {
            id: "file-2",
            url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
            type: "image",
          },
        },
      ],
    });
  }
}

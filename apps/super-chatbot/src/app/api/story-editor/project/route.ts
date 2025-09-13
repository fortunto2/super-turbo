import { type NextRequest, NextResponse } from "next/server";
import {
  getSuperduperAIConfig,
  OpenAPI,
  ProjectService,
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

    const config = await getSuperduperAIConfig();
    if (config.token) {
      OpenAPI.TOKEN = config.token;
    }
    if (config.url) {
      OpenAPI.BASE = config.url;
    }
    const project = await ProjectService.projectGetById({
      id: projectId,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);

    // In case of error, return placeholder for demonstration
    return NextResponse.json({
      success: true,
      project: null,
    });
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  IResponsePaginated_IVoiceRead_,
  ListOrderEnum,
  OpenAPI,
  SceneService,
  VoiceService,
} from "@turbo-super/api";

export type VoiceGetProps = typeof VoiceService.voiceGetList;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const orderBy = searchParams.get("orderBy") || "name";
    const order = (searchParams.get("order") as ListOrderEnum) || "descendent";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const config = await getSuperduperAIConfig();

    if (!config.token || !config.url) {
      return NextResponse.json(
        { error: "SuperDuperAI configuration not available" },
        { status: 500 }
      );
    }

    OpenAPI.BASE = config.url;
    OpenAPI.TOKEN = config.token;

    // Get scene via SceneService
    const response = await VoiceService.voiceGetList({
      limit,
      offset,
      order,
      orderBy,
    });

    if (!response) {
      return NextResponse.json(
        { error: "Voicovers not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching voiceover:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

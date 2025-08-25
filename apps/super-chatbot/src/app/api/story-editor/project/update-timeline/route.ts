import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getSuperduperAIConfig, OpenAPI, DataService } from "@turbo-super/api";
import type { IDataUpdate } from "@turbo-super/api";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: IDataUpdate = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting timeline update for data ID: ${id}`);

    const superduperaiConfig = getSuperduperAIConfig();
    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: "SuperDuperAI API token not configured" },
        { status: 500 }
      );
    }

    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    console.log(`🚀 Calling SuperDuperAI dataUpdate API for ID ${id}`);

    const result = await DataService.dataUpdate({
      id,
      requestBody: body,
    });

    console.log(`✅ Timeline update completed successfully for ID ${id}`);

    return NextResponse.json({
      success: true,
      message: "Timeline data updated successfully",
      data: result,
      id,
    });
  } catch (error: any) {
    console.error("Timeline Update API Error:", error);

    if (error.status === 422) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.body?.detail || "Invalid request data",
        },
        { status: 422 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    if (error.status === 400) {
      return NextResponse.json(
        {
          error: "Bad Request",
          details: error.body?.detail || "Invalid request",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

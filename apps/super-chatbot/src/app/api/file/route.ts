import { type NextRequest, NextResponse } from "next/server";
import { configureSuperduperAI } from "@/lib/config/superduperai";
import { FileService } from "@/lib/api/services/FileService";
import type { FileTypeEnum } from "@turbo-super/api";

export async function GET(request: NextRequest) {
  try {
    configureSuperduperAI();

    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get("sceneId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const typesParam = searchParams.get("types");

    const types = typesParam
      ? typesParam.split(",").map((t) => t.trim() as FileTypeEnum)
      : undefined;

    console.log("📁 File proxy: Getting files for:", {
      sceneId,
      projectId,
      types,
    });

    const fileData = await FileService.fileGetList({
      sceneId,
      projectId,
      types,
    });

    return NextResponse.json(fileData);
  } catch (error) {
    console.error("💥 File proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to get file status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

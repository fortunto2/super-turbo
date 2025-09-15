import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserProjects, getUserProjectStats } from "@/lib/db/project-queries";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "pending" | "processing" | "completed" | "failed" | null;
    const includeStats = searchParams.get("includeStats") === "true";

    const userId = session.user.id;

    // Get user projects
    const projects = await getUserProjects(userId, status || undefined);

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getUserProjectStats(userId);
    }

    return NextResponse.json({
      success: true,
      projects,
      stats,
      count: projects.length,
    });

  } catch (error: any) {
    console.error("User projects fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}




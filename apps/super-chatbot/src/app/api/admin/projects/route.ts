import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { deleteProject, getAllProjects } from "@/lib/db/admin-project-queries";
import { getMultipleProjectDetails } from "@/lib/api/admin-project-details";
import { getProjectStatus } from "@/lib/utils/project-status";

// Check if user is admin
function isAdmin(email?: string | null): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [
    "pranov.adiletqwe@gmail.com",
    "admin@superduperai.com",
    "support@superduperai.com",
    "dev@superduperai.com",
  ];
  return email ? adminEmails.includes(email) : false;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const result = await getAllProjects(page, limit, search);

    // Получаем детали проектов с задачами
    const projectIds = result.projects.map((p) => p.projectId);
    const projectDetails = await getMultipleProjectDetails(projectIds);

    // Обогащаем проекты информацией о статусе
    const enrichedProjects = result.projects.map((project) => {
      const details = projectDetails.get(project.projectId);
      const statusInfo = details ? getProjectStatus(details.tasks) : null;

      return {
        ...project,
        status: statusInfo?.status || "pending",
        errorStage: statusInfo?.errorStage,
        errorMessage: statusInfo?.errorMessage,
        completedStages: statusInfo?.completedStages || [],
        failedStages: statusInfo?.failedStages || [],
        tasks: details?.tasks || [],
      };
    });

    return NextResponse.json({
      success: true,
      projects: enrichedProjects,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Admin projects fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteProject(projectId);

    return NextResponse.json({
      message: "Project deleted successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("Admin project delete error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

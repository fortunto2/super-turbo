import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { userProject } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create database connection
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
const client = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(client);

// Получить все проекты пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projects = await db
      .select()
      .from(userProject)
      .where(eq(userProject.userId, userId))
      .orderBy(desc(userProject.createdAt));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Создать новый проект пользователя
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const newProject = await db
      .insert(userProject)
      .values({
        userId: session.user.id,
        projectId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      project: newProject[0],
    });
  } catch (error: any) {
    console.error("Error creating user project:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

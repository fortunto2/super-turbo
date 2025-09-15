import "server-only";

import { count, desc, eq, sql, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { userProject, user } from "./schema";

// Create database connection
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
const client = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(client);

export interface AdminProjectData {
  id: string;
  userId: string;
  projectId: string;
  createdAt: Date;
  userEmail: string;
  userBalance: number;
  userType: "guest" | "regular";
}

export async function getAllProjects(page = 1, limit = 20, search = "") {
  try {
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search
      ? sql`(${user.email} ILIKE ${`%${search}%`} OR ${userProject.projectId} ILIKE ${`%${search}%`})`
      : sql`1=1`;

    // Get projects with user info and pagination
    const projects = await db
      .select({
        id: userProject.id,
        userId: userProject.userId,
        projectId: userProject.projectId,
        createdAt: userProject.createdAt,
        userEmail: user.email,
        userBalance: user.balance,
      })
      .from(userProject)
      .innerJoin(user, eq(userProject.userId, user.id))
      .where(searchCondition)
      .orderBy(desc(userProject.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(userProject)
      .innerJoin(user, eq(userProject.userId, user.id))
      .where(searchCondition);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Add user type detection
    const projectsWithType: AdminProjectData[] = projects.map((p) => ({
      ...p,
      userType: p.userEmail.includes("guest") ? "guest" : "regular",
    }));

    return {
      projects: projectsWithType,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    throw error;
  }
}

export async function deleteProject(projectId: string) {
  try {
    // Delete project by projectId (not the database ID)
    const result = await db
      .delete(userProject)
      .where(eq(userProject.projectId, projectId));

    return { success: true, deletedCount: 1 };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

export async function getProjectStats() {
  try {
    // Get total projects count
    const totalProjectsResult = await db
      .select({ count: count() })
      .from(userProject);
    const totalProjects = totalProjectsResult[0]?.count || 0;

    // Get projects by user type
    const guestProjectsResult = await db
      .select({ count: count() })
      .from(userProject)
      .innerJoin(user, eq(userProject.userId, user.id))
      .where(sql`${user.email} LIKE '%guest%'`);
    const guestProjects = guestProjectsResult[0]?.count || 0;
    const regularProjects = totalProjects - guestProjects;

    // Get recent projects (last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentProjectsResult = await db
      .select({ count: count() })
      .from(userProject)
      .where(sql`${userProject.createdAt} >= ${yesterday.toISOString()}`);
    const recentProjects = recentProjectsResult[0]?.count || 0;

    // Get top users by project count
    const topUsersResult = await db
      .select({
        userId: userProject.userId,
        userEmail: user.email,
        projectCount: count(),
      })
      .from(userProject)
      .innerJoin(user, eq(userProject.userId, user.id))
      .groupBy(userProject.userId, user.email)
      .orderBy(desc(count()))
      .limit(10);

    return {
      totalProjects,
      guestProjects,
      regularProjects,
      recentProjects,
      topUsers: topUsersResult,
    };
  } catch (error) {
    console.error("Error fetching project stats:", error);
    throw error;
  }
}

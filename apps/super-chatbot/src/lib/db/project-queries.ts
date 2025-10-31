import 'server-only';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { userProject } from './schema';

// Create database connection
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const client = postgres(databaseUrl, { ssl: 'require' });
const db = drizzle(client);

export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProjectData {
  id: string;
  userId: string;
  projectId: string;
  status?: ProjectStatus; // Временно опциональное до миграции
  creditsUsed?: number; // Временно опциональное до миграции
  errorMessage?: string; // Временно опциональное до миграции
  createdAt: Date;
  updatedAt?: Date; // Временно опциональное до миграции
}

/**
 * Создает новый проект в базе данных
 */
export async function createUserProject(
  userId: string,
  projectId: string,
  creditsUsed = 0,
): Promise<ProjectData> {
  try {
    // Временно создаем проект без новых колонок до применения миграции
    const newProject = await db
      .insert(userProject)
      .values({
        userId,
        projectId,
        // status: "pending", // Временно отключено - требуется миграция
        // creditsUsed, // Временно отключено - требуется миграция
      })
      .returning();

    if (newProject.length === 0) {
      throw new Error('Failed to create project in database');
    }

    console.log(
      `💾 Project ${projectId} created in database for user ${userId} with status: pending`,
    );

    return newProject[0] as ProjectData;
  } catch (error) {
    console.error('Error creating user project:', error);
    throw error;
  }
}

/**
 * Обновляет статус проекта
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  errorMessage?: string,
): Promise<ProjectData | null> {
  try {
    // AICODE-NOTE: Временно отключено до применения миграции БД
    // Поля status, errorMessage, updatedAt будут доступны после миграции
    console.log(
      `⚠️ Project status update temporarily disabled - migration needed for fields: status, errorMessage, updatedAt`,
    );
    console.log(
      `📊 Project ${projectId} would be updated to: ${status}${
        errorMessage ? ` (Error: ${errorMessage})` : ''
      }`,
    );

    // Возвращаем существующий проект без обновления
    const existingProject = await getProjectByProjectId(projectId);
    return existingProject;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}

/**
 * Получает проект по ID
 */
export async function getProjectByProjectId(
  projectId: string,
): Promise<ProjectData | null> {
  try {
    const projects = await db
      .select()
      .from(userProject)
      .where(eq(userProject.projectId, projectId))
      .limit(1);

    return projects.length > 0 ? (projects[0] as ProjectData) : null;
  } catch (error) {
    console.error('Error fetching project by project ID:', error);
    throw error;
  }
}

/**
 * Получает все проекты пользователя
 */
export async function getUserProjects(
  userId: string,
  status?: ProjectStatus,
): Promise<ProjectData[]> {
  try {
    // AICODE-NOTE: Фильтрация по статусу временно отключена до миграции БД
    if (status) {
      console.warn(
        `⚠️ Status filtering temporarily disabled - migration needed for status field. Requested status: ${status}`,
      );
    }

    const projects = await db
      .select()
      .from(userProject)
      .where(eq(userProject.userId, userId))
      .orderBy(userProject.createdAt);

    return projects as ProjectData[];
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

/**
 * Удаляет проект (для отката при ошибках)
 */
export async function deleteUserProject(projectId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(userProject)
      .where(eq(userProject.projectId, projectId))
      .returning();

    const deleted = result.length > 0;

    if (deleted) {
      console.log(`🗑️ Project ${projectId} deleted from database`);
    } else {
      console.warn(`⚠️ Project ${projectId} not found for deletion`);
    }

    return deleted;
  } catch (error) {
    console.error('Error deleting user project:', error);
    throw error;
  }
}

/**
 * Получает статистику проектов пользователя
 */
export async function getUserProjectStats(userId: string): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalCreditsUsed: number;
}> {
  try {
    const projects = await getUserProjects(userId);

    // AICODE-NOTE: Временная реализация статистики до миграции БД
    // После миграции будут доступны поля status и creditsUsed
    const stats = {
      total: projects.length,
      pending: 0, // Временно 0 до миграции
      processing: 0, // Временно 0 до миграции
      completed: 0, // Временно 0 до миграции
      failed: 0, // Временно 0 до миграции
      totalCreditsUsed: 0, // Временно 0 до миграции
    };

    console.log(
      `⚠️ Project stats temporarily simplified - migration needed for status and creditsUsed fields`,
    );

    return stats;
  } catch (error) {
    console.error('Error fetching user project stats:', error);
    throw error;
  }
}

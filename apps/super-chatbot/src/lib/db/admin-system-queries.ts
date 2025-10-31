import 'server-only';

import { count, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user, document, userProject } from './schema';

// Create database connection
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const client = postgres(databaseUrl, { ssl: 'require' });
const db = drizzle(client);

export interface SystemStats {
  overview: {
    totalUsers: number;
    guestUsers: number;
    regularUsers: number;
    totalDocuments: number;
    totalProjects: number;
  };
  content: {
    totalDocuments: number;
    images: number;
    videos: number;
    texts: number;
  };
  activity: {
    recentUsers: number;
    recentDocuments: number;
    recentProjects: number;
    topCreators: Array<{
      userId: string;
      userEmail: string;
      documentCount: number;
    }>;
    topProjectCreators: Array<{
      userId: string;
      userEmail: string;
      projectCount: number;
    }>;
  };
  balance: {
    total: number;
    average: number;
    max: number;
    min: number;
  };
  system: {
    databaseSize: string;
    databaseName: string;
    postgresVersion: string;
    uptime: number;
  };
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Get overview stats
    const totalUsersResult = await db.select({ count: count() }).from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    const guestUsersResult = await db
      .select({ count: count() })
      .from(user)
      .where(sql`${user.email} LIKE '%guest%'`);
    const guestUsers = guestUsersResult[0]?.count || 0;
    const regularUsers = totalUsers - guestUsers;

    const totalDocumentsResult = await db
      .select({ count: count() })
      .from(document);
    const totalDocuments = totalDocumentsResult[0]?.count || 0;

    const totalProjectsResult = await db
      .select({ count: count() })
      .from(userProject);
    const totalProjects = totalProjectsResult[0]?.count || 0;

    // Get content breakdown
    const imagesResult = await db
      .select({ count: count() })
      .from(document)
      .where(sql`${document.kind} = 'image'`);
    const images = imagesResult[0]?.count || 0;

    const videosResult = await db
      .select({ count: count() })
      .from(document)
      .where(sql`${document.kind} = 'video'`);
    const videos = videosResult[0]?.count || 0;

    const texts = totalDocuments - images - videos;

    // Get recent activity (last 24h)
    const last24h = new Date();
    last24h.setDate(last24h.getDate() - 1);

    // Recent users (last 24h) - пока считаем всех, так как в user нет createdAt
    const recentUsers = await db.select({ count: count() }).from(user);

    // Recent documents (last 24h)
    const recentDocuments = await db
      .select({ count: count() })
      .from(document)
      .where(sql`${document.createdAt} >= ${last24h.toISOString()}`);

    // Recent projects (last 24h)
    const recentProjects = await db
      .select({ count: count() })
      .from(userProject)
      .where(sql`${userProject.createdAt} >= ${last24h.toISOString()}`);

    // Balance statistics
    const balanceStats = await db
      .select({
        total: sql<number>`COALESCE(SUM(${user.balance}), 0)`,
        average: sql<number>`COALESCE(AVG(${user.balance}), 0)`,
        max: sql<number>`COALESCE(MAX(${user.balance}), 0)`,
        min: sql<number>`COALESCE(MIN(${user.balance}), 0)`,
      })
      .from(user);

    // System information
    const systemInfo = await db.execute(sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        current_database() as database_name,
        version() as postgres_version,
        extract(epoch from now() - pg_postmaster_start_time()) as uptime
    `);

    const systemData = systemInfo[0] as any;
    console.log('System data from database:', systemData);
    console.log('Recent activity data:', {
      recentUsers: recentUsers[0]?.count || 0,
      recentDocuments: recentDocuments[0]?.count || 0,
      recentProjects: recentProjects[0]?.count || 0,
      last24h: last24h.toISOString(),
    });

    return {
      overview: {
        totalUsers,
        guestUsers,
        regularUsers,
        totalDocuments,
        totalProjects,
      },
      content: {
        totalDocuments,
        images,
        videos,
        texts,
      },
      activity: {
        recentUsers: recentUsers[0]?.count || 0,
        recentDocuments: recentDocuments[0]?.count || 0,
        recentProjects: recentProjects[0]?.count || 0,
        topCreators: [], // TODO: Implement top creators query
        topProjectCreators: [], // TODO: Implement top project creators query
      },
      balance: {
        total: balanceStats[0]?.total || 0,
        average: Math.round(balanceStats[0]?.average || 0),
        max: balanceStats[0]?.max || 0,
        min: balanceStats[0]?.min || 0,
      },
      system: {
        databaseSize: systemData?.database_size || 'Unknown',
        databaseName: systemData?.database_name || 'Unknown',
        postgresVersion: systemData?.postgres_version || 'Unknown',
        uptime: Math.round(systemData?.uptime || 0),
      },
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
}

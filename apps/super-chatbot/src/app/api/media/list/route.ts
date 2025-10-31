import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { generatedMedia } from '@/lib/db/schema';
import { ListMediaRequestSchema } from '@/lib/security/media-schemas';
import { auth } from '@/app/(auth)/auth';
import { getGuestSessionId } from '@/lib/session-utils';
import { eq, and, desc } from 'drizzle-orm';

// Database initialization
const client = postgres(
  process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  { ssl: 'require' },
);
const db = drizzle(client);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;

    const validation = ListMediaRequestSchema.safeParse({
      type,
      limit,
      offset,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = userId ? null : getGuestSessionId();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const conditions = [];

    if (userId) {
      conditions.push(eq(generatedMedia.userId, userId));
    } else if (sessionId) {
      conditions.push(eq(generatedMedia.sessionId, sessionId));
    }

    if (type && (type === 'image' || type === 'video')) {
      conditions.push(eq(generatedMedia.type, type as 'image' | 'video'));
    }

    const items = await db
      .select()
      .from(generatedMedia)
      .where(and(...conditions))
      .orderBy(desc(generatedMedia.createdAt))
      .limit(validation.data.limit)
      .offset(validation.data.offset);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        limit: validation.data.limit,
        offset: validation.data.offset,
        count: items.length,
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 },
    );
  }
}

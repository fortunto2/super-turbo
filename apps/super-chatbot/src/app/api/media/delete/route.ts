import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { generatedMedia } from '@/lib/db/schema';
import { DeleteMediaRequestSchema } from '@/lib/security/media-schemas';
import { auth } from '@/app/(auth)/auth';
import { getGuestSessionId } from '@/lib/session-utils';
import { eq, and } from 'drizzle-orm';

// Database initialization
const client = postgres(
  process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  { ssl: 'require' }
);
const db = drizzle(client);

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = DeleteMediaRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { id } = validation.data;

    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = userId ? null : getGuestSessionId();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'No valid session or user ID' },
        { status: 401 },
      );
    }

    const ownershipConditions = userId
      ? eq(generatedMedia.userId, userId)
      : sessionId
        ? eq(generatedMedia.sessionId, sessionId)
        : eq(generatedMedia.id, id); // Fallback: only match by ID if no user/session

    const deleted = await db
      .delete(generatedMedia)
      .where(
        and(
          eq(generatedMedia.id, id),
          ownershipConditions,
        ),
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Media not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: deleted[0],
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 },
    );
  }
}

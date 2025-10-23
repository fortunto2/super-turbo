import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { generatedMedia } from '@/lib/db/schema';
import { SaveMediaRequestSchema } from '@/lib/security/media-schemas';
import { auth } from '@/app/(auth)/auth';
import { getGuestSessionId } from '@/lib/session-utils';

// Database initialization
const client = postgres(
  process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  { ssl: 'require' }
);
const db = drizzle(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = SaveMediaRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 },
      );
    }

    const data = validation.data;

    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = userId ? null : getGuestSessionId();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const [saved] = await db
      .insert(generatedMedia)
      .values({
        userId: userId ? userId : null,
        sessionId: sessionId ? sessionId : null,
        type: data.type,
        url: data.url,
        prompt: data.prompt,
        model: data.model,
        settings: data.settings as any,
        projectId: data.projectId ? data.projectId : null,
        requestId: data.requestId ? data.requestId : null,
        fileId: data.fileId ? data.fileId : null,
        thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error saving media:', error);
    return NextResponse.json(
      { error: 'Failed to save media' },
      { status: 500 },
    );
  }
}

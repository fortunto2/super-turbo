import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getSystemStats } from '@/lib/db/admin-system-queries';

// Check if user is admin
function isAdmin(email?: string | null): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [
    'pranov.adiletqwe@gmail.com',
    'admin@superduperai.com',
    'support@superduperai.com',
    'dev@superduperai.com',
  ];
  return email ? adminEmails.includes(email) : false;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('System stats fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

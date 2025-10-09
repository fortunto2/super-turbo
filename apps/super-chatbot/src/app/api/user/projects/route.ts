import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUserProjects, getUserProjectStats } from '@/lib/db/project-queries';
import { getMultipleProjectDetails } from '@/lib/api/admin-project-details';
import { getProjectStatus } from '@/lib/utils/project-status';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | null;
    const includeStats = searchParams.get('includeStats') === 'true';

    const userId = session.user.id;

    // Get user projects
    const projects = await getUserProjects(userId, status || undefined);

    // Get project details with tasks from SuperDuperAI API
    const projectIds = projects.map((p) => p.projectId);
    const projectDetails = await getMultipleProjectDetails(projectIds);

    // Enrich projects with status information
    const enrichedProjects = projects.map((project) => {
      const details = projectDetails.get(project.projectId);
      const statusInfo = details ? getProjectStatus(details.tasks) : null;

      return {
        ...project,
        status: statusInfo?.status || 'pending',
        errorStage: statusInfo?.errorStage,
        errorMessage: statusInfo?.errorMessage,
        completedStages: statusInfo?.completedStages || [],
        failedStages: statusInfo?.failedStages || [],
        tasks: details?.tasks || [],
      };
    });

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getUserProjectStats(userId);
    }

    return NextResponse.json({
      success: true,
      projects: enrichedProjects,
      stats,
      count: enrichedProjects.length,
    });
  } catch (error: any) {
    console.error('User projects fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

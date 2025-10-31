import { type NextRequest, NextResponse } from 'next/server';
import {
  updateProjectStatus,
  getProjectByProjectId,
} from '@/lib/db/project-queries';
import { handlePrefectError } from '@/lib/utils/project-error-handler';

interface StatusUpdateRequest {
  projectId: string;
  status: 'completed' | 'failed';
  errorMessage?: string;
  creditsUsed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: StatusUpdateRequest = await request.json();
    const { projectId, status, errorMessage, creditsUsed } = body;

    // Validate input
    if (!projectId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId and status' },
        { status: 400 },
      );
    }

    if (!['completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'completed' or 'failed'" },
        { status: 400 },
      );
    }

    // Check if project exists
    const project = await getProjectByProjectId(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project status
    const updatedProject = await updateProjectStatus(
      projectId,
      status,
      errorMessage,
    );

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Failed to update project status' },
        { status: 500 },
      );
    }

    // If project failed, handle the error (refund credits, etc.)
    if (status === 'failed' && errorMessage) {
      await handlePrefectError(
        projectId,
        project.userId,
        project.creditsUsed || 0,
        new Error(errorMessage),
      );
    }

    console.log(
      `📊 Project ${projectId} status updated to: ${status}${
        errorMessage ? ` (Error: ${errorMessage})` : ''
      }`,
    );

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: `Project status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Project status update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 },
      );
    }

    const project = await getProjectByProjectId(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error('Project status fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

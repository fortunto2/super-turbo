import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

/**
 * Proxy endpoint for Vertex AI video downloads
 *
 * Downloads video from Google's servers with API key authentication
 * and streams it to the client without exposing the API key
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎥 Vertex AI Video Proxy called');

    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Get video URL from query params
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 },
      );
    }

    console.log(
      '📥 Downloading video from:',
      `${videoUrl.substring(0, 50)}...`,
    );

    // Get API key
    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.VERTEXT_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Vertex AI API key not configured' },
        { status: 500 },
      );
    }

    // Download video with API key authentication
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to download video:', response.status, errorText);
      return NextResponse.json(
        {
          error: 'Failed to download video',
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      );
    }

    console.log('✅ Video downloaded successfully, streaming to client');

    // Get video data
    const videoBuffer = await response.arrayBuffer();

    // Stream video to client with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('💥 Vertex Video Proxy error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to proxy video',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

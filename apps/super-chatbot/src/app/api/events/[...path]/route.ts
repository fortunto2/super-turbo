import type { NextRequest } from 'next/server';
import { getSuperduperAIConfig } from '../../../../lib/config/superduperai';
import { auth } from '@/app/(auth)/auth';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // Проверяем авторизацию пользователя
    const session = await auth();
    if (!session?.user) {
      console.log('❌ SSE Proxy: Unauthorized - no session');
      return new Response('Unauthorized', { status: 401 });
    }

    const config = getSuperduperAIConfig();
    const resolvedParams = await params;
    const eventPath = resolvedParams.path.join('/');

    console.log('🔌 SSE Proxy: Setting up for path:', eventPath);
    console.log('🔌 SSE Proxy: Backend URL:', config.url);
    console.log('🔌 SSE Proxy: User:', session.user.email);

    // Construct the backend SSE URL
    const backendSSEUrl = `${config.url}/api/v1/events/${eventPath}`;
    console.log('🔌 SSE Proxy: Proxying to:', backendSSEUrl);

    // Create headers for the backend request
    const headers: HeadersInit = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      'User-Agent': `SuperChatbot/3.0.22 (NextJS/${process.env.NODE_ENV || 'development'})`,
    };

    // Add authorization - обязательно нужен токен для SuperDuperAI
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
      console.log('🔑 SSE Proxy: Added authorization token');
    } else {
      console.error('❌ SSE Proxy: No token available');
      return new Response('No API token available', { status: 500 });
    }

    // Connect to backend SSE
    console.log('🔌 SSE Proxy: Making request to backend...');
    const response = await fetch(backendSSEUrl, {
      method: 'GET',
      headers,
    });

    console.log('🔌 SSE Proxy: Backend response status:', response.status);
    console.log(
      '🔌 SSE Proxy: Backend response headers:',
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '❌ SSE Proxy: Backend response not ok:',
        response.status,
        response.statusText,
      );
      console.error('❌ SSE Proxy: Error details:', errorText);
      return new Response(
        `SSE Backend Error: ${response.status} ${response.statusText}\n${errorText}`,
        {
          status: response.status,
        },
      );
    }

    if (!response.body) {
      console.error('❌ SSE Proxy: No response body from backend');
      return new Response('SSE Backend Error: No response body', {
        status: 500,
      });
    }

    console.log('✅ SSE Proxy: Successfully connected to backend');

    // Create a ReadableStream to proxy the SSE data
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const stream = new ReadableStream({
      start(controller) {
        console.log('🔌 SSE Proxy: Stream started');

        reader = response.body?.getReader() || null;
        if (!reader) {
          controller.error(
            new Error('Failed to get reader from response body'),
          );
          return;
        }

        const decoder = new TextDecoder();

        function pump(): Promise<void> | undefined {
          if (!reader) {
            return Promise.resolve();
          }

          return reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                console.log('🔌 SSE Proxy: Stream completed');
                try {
                  // Check if controller is not already closed before closing
                  if (controller.desiredSize !== null) {
                    controller.close();
                  }
                } catch (error) {
                  // Controller already closed, ignore error
                  console.log(
                    '🔌 SSE Proxy: Controller already closed, ignoring',
                  );
                }
                return;
              }

              // Decode and forward the chunk
              const chunk = decoder.decode(value, { stream: true });
              console.log(
                '📡 SSE Proxy: Forwarding chunk:',
                `${chunk.substring(0, 100)}...`,
              );

              controller.enqueue(new TextEncoder().encode(chunk));
              return pump();
            })
            .catch((error) => {
              console.error('❌ SSE Proxy: Stream error:', error);
              controller.error(error);
            });
        }

        pump();
      },

      cancel() {
        console.log('🔌 SSE Proxy: Stream cancelled');
        reader?.cancel();
      },
    });

    // Return SSE response with proper headers
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('❌ SSE Proxy: Setup error:', error);
    return new Response(
      `SSE Proxy Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
      },
    );
  }
}

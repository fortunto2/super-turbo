import { type NextRequest, NextResponse } from 'next/server';

// Простые метрики в памяти
const simpleMetrics = {
  requests: new Map<
    string,
    { count: number; errors: number; totalTime: number }
  >(),
  lastReset: Date.now(),
};

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    // Сбрасываем метрики каждый час
    if (now - simpleMetrics.lastReset > 3600000) {
      simpleMetrics.requests.clear();
      simpleMetrics.lastReset = now;
    }

    // Получаем системные метрики
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    // Агрегируем API метрики
    const apiMetrics = Array.from(simpleMetrics.requests.entries()).map(
      ([endpoint, data]) => ({
        endpoint,
        requests: data.count,
        errors: data.errors,
        averageTime: data.count > 0 ? data.totalTime / data.count : 0,
        errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
      }),
    );

    const response = {
      status: 'success',
      data: {
        system: systemMetrics,
        api: {
          endpoints: apiMetrics,
          totalRequests: Array.from(simpleMetrics.requests.values()).reduce(
            (sum, data) => sum + data.count,
            0,
          ),
          totalErrors: Array.from(simpleMetrics.requests.values()).reduce(
            (sum, data) => sum + data.errors,
            0,
          ),
        },
        summary: {
          uptime: systemMetrics.uptime,
          memoryUsage:
            (systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) *
            100,
          totalEndpoints: apiMetrics.length,
        },
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Функция для обновления метрик (будет вызываться из API routes)
function updateMetrics(endpoint: string, duration: number, status: number) {
  const current = simpleMetrics.requests.get(endpoint) || {
    count: 0,
    errors: 0,
    totalTime: 0,
  };
  current.count++;
  current.totalTime += duration;

  if (status >= 400) {
    current.errors++;
  }

  simpleMetrics.requests.set(endpoint, current);
}

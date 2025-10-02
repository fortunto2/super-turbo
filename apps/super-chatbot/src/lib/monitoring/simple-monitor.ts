

// Простые метрики в памяти
const metrics = {
  requests: new Map<
    string,
    { count: number; errors: number; totalTime: number }
  >(),
  lastReset: Date.now(),
};

/**
 * Обновляет метрики для API endpoint
 */
export function trackApiRequest(
  endpoint: string,
  duration: number,
  status: number
) {
  const current = metrics.requests.get(endpoint) || {
    count: 0,
    errors: 0,
    totalTime: 0,
  };
  current.count++;
  current.totalTime += duration;

  if (status >= 400) {
    current.errors++;
  }

  metrics.requests.set(endpoint, current);

  // Сбрасываем метрики каждый час
  const now = Date.now();
  if (now - metrics.lastReset > 3600000) {
    metrics.requests.clear();
    metrics.lastReset = now;
  }
}

/**
 * Получает текущие метрики
 */
export function getMetrics() {
  return {
    requests: Object.fromEntries(metrics.requests),
    lastReset: metrics.lastReset,
    totalRequests: Array.from(metrics.requests.values()).reduce(
      (sum, data) => sum + data.count,
      0
    ),
    totalErrors: Array.from(metrics.requests.values()).reduce(
      (sum, data) => sum + data.errors,
      0
    ),
  };
}

/**
 * Middleware для автоматического отслеживания API requests
 */
export function withMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as Request;
    const startTime = Date.now();

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Отслеживаем успешный запрос
      const url = new URL(request.url);
      trackApiRequest(url.pathname, duration, response.status);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Отслеживаем ошибку
      const url = new URL(request.url);
      trackApiRequest(url.pathname, duration, 500);

      throw error;
    }
  };
}

/**
 * Простая проверка здоровья системы
 */
export function getHealthStatus() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    status: "healthy",
    uptime,
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      unit: "MB",
    },
    metrics: {
      totalRequests: Array.from(metrics.requests.values()).reduce(
        (sum, data) => sum + data.count,
        0
      ),
      totalErrors: Array.from(metrics.requests.values()).reduce(
        (sum, data) => sum + data.errors,
        0
      ),
      endpoints: metrics.requests.size,
    },
  };
}

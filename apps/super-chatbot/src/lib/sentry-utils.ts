import * as Sentry from "@sentry/nextjs";

export function logHttpError(
  error: Error,
  request: Request,
  statusCode: number
) {
  const url = new URL(request.url);

  Sentry.withScope((scope) => {
    scope.setExtra("url", request.url);
    scope.setExtra("method", request.method);
    scope.setExtra("path", url.pathname);
    scope.setExtra("query", Object.fromEntries(url.searchParams.entries()));
    scope.setExtra("statusCode", statusCode);

    try {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (!["authorization", "cookie"].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
      scope.setExtra("headers", headers);
    } catch (e) {
      // Ignore header extraction errors
    }

    Sentry.captureException(error);
  });
}

export function logApiError(error: Error, context: Record<string, any> = {}) {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
}

/**
 * Создает новый span для трассировки производительности
 */
// export function createSpan(
//   name: string,
//   operation: string,
//   callback: () => Promise<any>,
// ) {
//   return Sentry.startSpan(
//     {
//       name,
//       op: operation,
//     },
//     callback,
//   );
// }

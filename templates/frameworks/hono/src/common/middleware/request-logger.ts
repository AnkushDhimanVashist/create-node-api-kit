import { createMiddleware } from 'hono/factory';
import { logger } from '../../lib/logger.js';

/** One structured log line per request (health checks are skipped to keep logs quiet). */
export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now();
  await next();
  if (c.req.path.startsWith('/health')) return;
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - start),
    },
    'request completed',
  );
});

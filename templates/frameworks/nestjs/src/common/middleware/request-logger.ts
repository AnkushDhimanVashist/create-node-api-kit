import type { NextFunction, Request, Response } from 'express';
import { logger } from '../../lib/logger.js';

/** One structured log line per request (health checks are skipped to keep logs quiet). */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  res.on('finish', () => {
    if (req.originalUrl.startsWith('/health')) return;
    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(performance.now() - start),
      },
      'request completed',
    );
  });
  next();
}

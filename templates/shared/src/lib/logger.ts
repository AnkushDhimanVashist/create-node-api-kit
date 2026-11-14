import { pino } from 'pino';
import { env } from '../config/env.js';

/**
 * App-wide structured logger.
 * - Development: pretty, colored output.
 * - Production: JSON lines, ready for any log collector.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
});

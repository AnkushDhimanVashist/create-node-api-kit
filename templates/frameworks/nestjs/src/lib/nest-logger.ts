import type { LoggerService } from '@nestjs/common';
import { logger } from './logger.js';

/** Routes Nest's own log messages through the app's Pino logger. */
export class NestPinoLogger implements LoggerService {
  log(message: unknown, ...params: unknown[]) {
    logger.info({ context: contextOf(params) }, String(message));
  }
  error(message: unknown, ...params: unknown[]) {
    logger.error({ context: contextOf(params) }, String(message));
  }
  warn(message: unknown, ...params: unknown[]) {
    logger.warn({ context: contextOf(params) }, String(message));
  }
  debug(message: unknown, ...params: unknown[]) {
    logger.debug({ context: contextOf(params) }, String(message));
  }
  verbose(message: unknown, ...params: unknown[]) {
    logger.trace({ context: contextOf(params) }, String(message));
  }
}

/** Nest passes the context (class name) as the last string argument. */
function contextOf(params: unknown[]): string | undefined {
  const last = params.at(-1);
  return typeof last === 'string' ? last : undefined;
}

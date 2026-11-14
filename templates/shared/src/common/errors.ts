import { STATUS_CODES } from 'node:http';

/**
 * Throw an AppError anywhere (service, repository, middleware) and the
 * framework error handler turns it into a clean JSON response.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code ?? statusToCode(statusCode);
    this.details = details;
  }
}

export const badRequest = (message = 'Bad request', details?: unknown) =>
  new AppError(400, message, 'BAD_REQUEST', details);
export const unauthorized = (message = 'Unauthorized') => new AppError(401, message);
export const forbidden = (message = 'Forbidden') => new AppError(403, message);
export const notFound = (message = 'Not found') => new AppError(404, message);
export const conflict = (message = 'Conflict') => new AppError(409, message);

/** The shape of every error the API returns. */
export interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

function statusToCode(status: number): string {
  return (STATUS_CODES[status] ?? 'Error').toUpperCase().replace(/\W+/g, '_');
}

function statusOf(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const candidate = (err as { statusCode?: unknown; status?: unknown }).statusCode ??
    (err as { status?: unknown }).status;
  return typeof candidate === 'number' ? candidate : undefined;
}

/**
 * Converts any thrown value into a status code + JSON body.
 * Unknown errors become a generic 500 so internals never leak to clients.
 */
export function toErrorResponse(err: unknown): { statusCode: number; body: ErrorBody } {
  if (err instanceof AppError) {
    const body: ErrorBody = { error: { code: err.code, message: err.message } };
    if (err.details !== undefined) body.error.details = err.details;
    return { statusCode: err.statusCode, body };
  }

  // Errors raised by the framework itself (bad JSON, payload too large, ...).
  const status = statusOf(err);
  if (status !== undefined && status >= 400 && status < 500) {
    const message = err instanceof Error ? err.message : 'Bad request';
    return { statusCode: status, body: { error: { code: statusToCode(status), message } } };
  }

  return {
    statusCode: 500,
    body: { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } },
  };
}

import type { z } from 'zod';
import { badRequest } from './errors.js';

/**
 * Parses `data` with a Zod schema and returns the typed result.
 * On failure it throws a 400 AppError listing every invalid field.
 *
 * Framework-agnostic: use it on request bodies, params or query strings.
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest(
      'Validation failed',
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }
  return result.data;
}

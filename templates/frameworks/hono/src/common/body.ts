import type { Context } from 'hono';
import { badRequest } from './errors.js';

/** Reads the JSON body, turning malformed JSON into a 400 instead of a 500. */
export async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw badRequest('Request body must be valid JSON');
  }
}

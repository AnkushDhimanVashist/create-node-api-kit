import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { readBearerToken, verifyAccessToken } from '../../lib/jwt.js';
import type { AuthUser } from '../../lib/jwt.js';
import type { AppEnv } from '../context.js';
import { unauthorized } from '../errors.js';

/** Rejects the request with 401 unless it carries a valid access token. */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  c.set('user', verifyAccessToken(readBearerToken(c.req.header('authorization'))));
  await next();
});

/** The authenticated user. Only use after `requireAuth`. */
export function getAuthUser(c: Context<AppEnv>): AuthUser {
  const user = c.get('user');
  if (!user) throw unauthorized();
  return user;
}

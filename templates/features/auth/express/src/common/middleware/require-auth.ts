import type { RequestHandler, Response } from 'express';
import { readBearerToken, verifyAccessToken } from '../../lib/jwt.js';
import type { AuthUser } from '../../lib/jwt.js';
import { unauthorized } from '../errors.js';

/** Rejects the request with 401 unless it carries a valid access token. */
export const requireAuth: RequestHandler = (req, res, next) => {
  res.locals.user = verifyAccessToken(readBearerToken(req.headers.authorization));
  next();
};

/** The authenticated user. Only use after `requireAuth`. */
export function getAuthUser(res: Response): AuthUser {
  const user = res.locals.user as AuthUser | undefined;
  if (!user) throw unauthorized();
  return user;
}

import type { FastifyRequest } from 'fastify';
import { readBearerToken, verifyAccessToken } from '../lib/jwt.js';
import type { AuthUser } from '../lib/jwt.js';
import { unauthorized } from './errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null;
  }
}

/** preHandler hook: rejects the request with 401 unless it carries a valid access token. */
export async function requireAuth(request: FastifyRequest) {
  request.user = verifyAccessToken(readBearerToken(request.headers.authorization));
}

/** The authenticated user. Only use after `requireAuth`. */
export function getAuthUser(request: FastifyRequest): AuthUser {
  if (!request.user) throw unauthorized();
  return request.user;
}

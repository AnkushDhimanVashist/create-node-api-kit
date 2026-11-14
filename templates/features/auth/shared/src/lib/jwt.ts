import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../common/errors.js';

/** The identity attached to every authenticated request. */
export interface AuthUser {
  id: string;
  email: string;
}

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

/** Returns the user inside a valid token, or throws a 401. */
export function verifyAccessToken(token: string): AuthUser {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new Error('Malformed token');
    }
    return { id: payload.sub, email: payload.email };
  } catch {
    throw unauthorized('Invalid or expired token');
  }
}

/** Extracts the token from an `Authorization: Bearer <token>` header. */
export function readBearerToken(header: string | undefined): string {
  if (!header?.startsWith('Bearer ')) throw unauthorized('Missing bearer token');
  return header.slice('Bearer '.length).trim();
}

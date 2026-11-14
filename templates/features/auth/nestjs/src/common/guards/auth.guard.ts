import { Injectable, createParamDecorator } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { readBearerToken, verifyAccessToken } from '../../lib/jwt.js';
import type { AuthUser } from '../../lib/jwt.js';
import { unauthorized } from '../errors.js';

type AuthenticatedRequest = Request & { user?: AuthUser };

/** Rejects the request with 401 unless it carries a valid access token. */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = verifyAccessToken(readBearerToken(request.headers.authorization));
    return true;
  }
}

/** Injects the authenticated user into a route handler. Use together with AuthGuard. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => {
  const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  if (!user) throw unauthorized();
  return user;
});

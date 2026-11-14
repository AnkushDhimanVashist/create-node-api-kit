import type { FastifyPluginAsync } from 'fastify';
import { getAuthUser, requireAuth } from '../../common/auth.js';
import { validate } from '../../common/validate.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { authService } from './auth.service.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const input = validate(registerSchema, request.body);
    return reply.status(201).send(await authService.register(input));
  });

  app.post('/login', async (request) => {
    const input = validate(loginSchema, request.body);
    return authService.login(input);
  });

  app.get('/me', { preHandler: requireAuth }, async (request) => {
    return authService.me(getAuthUser(request));
  });
};

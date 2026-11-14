import { Hono } from 'hono';
import { readJson } from '../../common/body.js';
import type { AppEnv } from '../../common/context.js';
import { getAuthUser, requireAuth } from '../../common/middleware/require-auth.js';
import { validate } from '../../common/validate.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { authService } from './auth.service.js';

export const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', async (c) => {
  const input = validate(registerSchema, await readJson(c));
  return c.json(await authService.register(input), 201);
});

authRoutes.post('/login', async (c) => {
  const input = validate(loginSchema, await readJson(c));
  return c.json(await authService.login(input));
});

authRoutes.get('/me', requireAuth, async (c) => {
  return c.json(await authService.me(getAuthUser(c)));
});

import { Router } from 'express';
import { getAuthUser, requireAuth } from '../../common/middleware/require-auth.js';
import { validate } from '../../common/validate.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { authService } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const input = validate(registerSchema, req.body);
  res.status(201).json(await authService.register(input));
});

authRouter.post('/login', async (req, res) => {
  const input = validate(loginSchema, req.body);
  res.json(await authService.login(input));
});

authRouter.get('/me', requireAuth, async (_req, res) => {
  res.json(await authService.me(getAuthUser(res)));
});

import { z } from 'zod';
import { createUserSchema, publicUserSchema } from '../users/user.schema.js';

export const registerSchema = createUserSchema.extend({
  // bcrypt only uses the first 72 bytes of a password
  password: z.string().min(8).max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const authResponseSchema = z.object({
  user: publicUserSchema,
  accessToken: z.string(),
});

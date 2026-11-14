import { z } from 'zod';

/**
 * Request validation schemas for the users module.
 * The same schemas power runtime validation, TypeScript types and the OpenAPI docs.
 */

export const createUserSchema = z.object({
  email: z.email().max(254),
  name: z.string().trim().min(1).max(100),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listUsersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const publicUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});

import { randomUUID } from 'node:crypto';
import type { NewUser, User, UserRepository } from './user.entity.js';

/**
 * In-memory storage: data is lost on restart.
 * To add a real database, re-run create-node-api-kit with a database option,
 * or implement the same UserRepository interface with your database of choice.
 */
const users = new Map<string, User>();

export const userRepository: UserRepository = {
  async findMany({ limit, offset }) {
    return [...users.values()].slice(offset, offset + limit);
  },
  async count() {
    return users.size;
  },
  async findById(id) {
    return users.get(id) ?? null;
  },
  async findByEmail(email) {
    return [...users.values()].find((u) => u.email === email) ?? null;
  },
  async create(data: NewUser) {
    const user: User = { id: randomUUID(), ...data, createdAt: new Date() };
    users.set(user.id, user);
    return user;
  },
  async delete(id) {
    return users.delete(id);
  },
};

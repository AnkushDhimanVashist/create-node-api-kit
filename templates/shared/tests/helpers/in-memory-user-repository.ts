import { randomUUID } from 'node:crypto';
import type { NewUser, User, UserRepository } from '../../src/modules/users/user.entity.js';

/**
 * A fake repository that keeps users in memory.
 * Tests swap the real (database) repository for this one in tests/setup,
 * so the test suite runs without any database.
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

export function resetUsers(): void {
  users.clear();
}

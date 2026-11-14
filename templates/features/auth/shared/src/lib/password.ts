import bcrypt from 'bcryptjs';
import { isTest } from '../config/env.js';

// Fewer rounds in tests keeps the suite fast; 12 is a good production default.
const ROUNDS = isTest ? 4 : 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

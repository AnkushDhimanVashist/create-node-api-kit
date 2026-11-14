import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env.js';
import * as schema from '../db/schema.js';
import { logger } from './logger.js';

const pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });

export const db = drizzle(pool, { schema });

export async function connectDatabase(): Promise<void> {
  // The pool connects lazily: run one query so a bad DATABASE_URL fails at startup.
  await pingDatabase();
  logger.info('Connected to PostgreSQL (Drizzle)');
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
}

export async function pingDatabase(): Promise<void> {
  await db.execute(sql`SELECT 1`);
}

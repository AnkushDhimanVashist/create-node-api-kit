import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Shared Redis connection. `lazyConnect` means nothing happens until
 * connectRedis() runs at startup (tests never open a connection).
 */
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export async function connectRedis(): Promise<void> {
  // Something (e.g. the rate limiter) may already have triggered the connection.
  if (redis.status === 'wait') await redis.connect();
  await redis.ping();
  logger.info('Connected to Redis');
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}

export async function pingRedis(): Promise<void> {
  await redis.ping();
}

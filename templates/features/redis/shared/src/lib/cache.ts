import { logger } from './logger.js';
import { redis } from './redis.js';

/**
 * Tiny JSON cache on top of Redis.
 * Cache errors are logged and ignored: if Redis is down the app keeps working,
 * it just reads from the database every time.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn({ err, key }, 'Cache read failed');
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn({ err, key }, 'Cache write failed');
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.warn({ err, keys }, 'Cache delete failed');
    }
  },

  /** Deletes every key that starts with `prefix` (uses SCAN, safe on large databases). */
  async delByPrefix(prefix: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = next;
        if (keys.length > 0) await redis.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      logger.warn({ err, prefix }, 'Cache prefix delete failed');
    }
  },

  /** Returns the cached value, or runs `fn`, caches its result and returns it. */
  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fn();
    await cache.set(key, fresh, ttlSeconds);
    return fresh;
  },
};

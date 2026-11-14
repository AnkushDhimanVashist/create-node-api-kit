import type { ThrottlerStorage } from '@nestjs/throttler';
import { redis } from '../lib/redis.js';

/** Stores rate-limit counters in Redis so every server instance shares the same limit. */
export class RedisThrottlerStorage implements ThrottlerStorage {
  async increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string) {
    const redisKey = `rate-limit:${throttlerName}:${key}`;
    const results = await redis.multi().incr(redisKey).pexpire(redisKey, ttl, 'NX').pttl(redisKey).exec();
    const totalHits = Number(results?.[0]?.[1] ?? 1);
    const timeToExpire = Math.ceil(Number(results?.[2]?.[1] ?? ttl) / 1000);
    const isBlocked = totalHits > limit;
    return {
      totalHits,
      timeToExpire,
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.ceil(blockDuration / 1000) || timeToExpire : 0,
    };
  }
}

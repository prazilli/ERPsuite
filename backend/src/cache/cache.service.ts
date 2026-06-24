import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, MemoryCacheEntry>();
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    // Start memory cache sweeper every 30 seconds
    this.sweepInterval = setInterval(() => this.sweepExpiredKeys(), 30000);
  }

  onModuleDestroy() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const provider = this.redisService.getProviderType();
    const client = this.redisService.getClient();

    if (provider === 'redis' && client) {
      try {
        await client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        this.logger.error(`Redis set failed, falling back to memory. Error: ${err.message}`);
      }
    }

    // Fallback to memory
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const provider = this.redisService.getProviderType();
    const client = this.redisService.getClient();

    if (provider === 'redis' && client) {
      try {
        const val = await client.get(key);
        return val;
      } catch (err) {
        this.logger.error(`Redis get failed, falling back to memory. Error: ${err.message}`);
      }
    }

    // Fallback to memory
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string): Promise<void> {
    const provider = this.redisService.getProviderType();
    const client = this.redisService.getClient();

    if (provider === 'redis' && client) {
      try {
        await client.del(key);
        return;
      } catch (err) {
        this.logger.error(`Redis del failed, falling back to memory. Error: ${err.message}`);
      }
    }

    this.memoryCache.delete(key);
  }

  async incr(key: string): Promise<number> {
    const provider = this.redisService.getProviderType();
    const client = this.redisService.getClient();

    if (provider === 'redis' && client) {
      try {
        const count = await client.incr(key);
        return count;
      } catch (err) {
        this.logger.error(`Redis incr failed, falling back to memory. Error: ${err.message}`);
      }
    }

    // Fallback to memory increment
    const entry = this.memoryCache.get(key);
    let count = 1;
    if (entry && Date.now() <= entry.expiresAt) {
      count = parseInt(entry.value, 10) + 1;
    }
    // Maintain a 5 minutes expiry for attempt counts if setting new
    const ttl = entry ? (entry.expiresAt - Date.now()) / 1000 : 300;
    await this.set(key, count.toString(), Math.max(ttl, 1));
    return count;
  }

  private sweepExpiredKeys() {
    const now = Date.now();
    let swept = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        swept++;
      }
    }
    if (swept > 0) {
      this.logger.verbose(`In-memory cache swept. Removed ${swept} expired keys.`);
    }
  }
}

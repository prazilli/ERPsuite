import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private providerType: 'redis' | 'memory' = 'memory';
  private fallbackTriggered = false;

  async onModuleInit() {
    const isEnabled = process.env.REDIS_ENABLED === 'true';

    if (!isEnabled) {
      this.providerType = 'memory';
      this.logger.log('Redis is disabled by configuration. Using In-Memory Cache.');
      return;
    }

    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);

    try {
      this.client = new Redis({
        host,
        port,
        connectTimeout: 2000,
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        retryStrategy: (times) => {
          if (times >= 3) {
            this.triggerFallback();
            return null; // Stop retrying
          }
          return 500; // Retry after 500ms
        },
      });

      // Handle connection errors silently to avoid console spam and crash prevention
      this.client.on('error', (err) => {
        this.triggerFallback();
      });

      // Attempt initial connection
      await this.client.connect();
      this.providerType = 'redis';
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    } catch (err) {
      this.triggerFallback();
    }
  }

  private triggerFallback() {
    if (!this.fallbackTriggered) {
      this.fallbackTriggered = true;
      this.providerType = 'memory';
      this.logger.warn('Redis unavailable. Falling back to in-memory cache.');
      
      if (this.client) {
        try {
          this.client.disconnect();
        } catch (e) {
          // ignore disconnect errors
        }
      }
    }
  }

  onModuleDestroy() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (e) {
        // ignore disconnect errors
      }
    }
  }

  getProviderType(): 'redis' | 'memory' {
    return this.providerType;
  }

  getClient(): Redis | null {
    return this.providerType === 'redis' ? this.client : null;
  }
}

import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
export declare class CacheService implements OnModuleInit, OnModuleDestroy {
    private readonly redisService;
    private readonly logger;
    private readonly memoryCache;
    private sweepInterval;
    constructor(redisService: RedisService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    set(key: string, value: string, ttlSeconds: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    private sweepExpiredKeys;
}

import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private client;
    private providerType;
    private fallbackTriggered;
    onModuleInit(): Promise<void>;
    private triggerFallback;
    onModuleDestroy(): void;
    getProviderType(): 'redis' | 'memory';
    getClient(): Redis | null;
}

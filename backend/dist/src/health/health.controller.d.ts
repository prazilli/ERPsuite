import { RedisService } from '../redis/redis.service';
export declare class HealthController {
    private readonly redisService;
    constructor(redisService: RedisService);
    getCacheStatus(): {
        cache: "redis" | "memory";
    };
}

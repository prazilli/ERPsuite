"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let CacheService = CacheService_1 = class CacheService {
    redisService;
    logger = new common_1.Logger(CacheService_1.name);
    memoryCache = new Map();
    sweepInterval = null;
    constructor(redisService) {
        this.redisService = redisService;
    }
    onModuleInit() {
        this.sweepInterval = setInterval(() => this.sweepExpiredKeys(), 30000);
    }
    onModuleDestroy() {
        if (this.sweepInterval) {
            clearInterval(this.sweepInterval);
        }
    }
    async set(key, value, ttlSeconds) {
        const provider = this.redisService.getProviderType();
        const client = this.redisService.getClient();
        if (provider === 'redis' && client) {
            try {
                await client.set(key, value, 'EX', ttlSeconds);
                return;
            }
            catch (err) {
                this.logger.error(`Redis set failed, falling back to memory. Error: ${err.message}`);
            }
        }
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.memoryCache.set(key, { value, expiresAt });
    }
    async get(key) {
        const provider = this.redisService.getProviderType();
        const client = this.redisService.getClient();
        if (provider === 'redis' && client) {
            try {
                const val = await client.get(key);
                return val;
            }
            catch (err) {
                this.logger.error(`Redis get failed, falling back to memory. Error: ${err.message}`);
            }
        }
        const entry = this.memoryCache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return entry.value;
    }
    async del(key) {
        const provider = this.redisService.getProviderType();
        const client = this.redisService.getClient();
        if (provider === 'redis' && client) {
            try {
                await client.del(key);
                return;
            }
            catch (err) {
                this.logger.error(`Redis del failed, falling back to memory. Error: ${err.message}`);
            }
        }
        this.memoryCache.delete(key);
    }
    async incr(key) {
        const provider = this.redisService.getProviderType();
        const client = this.redisService.getClient();
        if (provider === 'redis' && client) {
            try {
                const count = await client.incr(key);
                return count;
            }
            catch (err) {
                this.logger.error(`Redis incr failed, falling back to memory. Error: ${err.message}`);
            }
        }
        const entry = this.memoryCache.get(key);
        let count = 1;
        if (entry && Date.now() <= entry.expiresAt) {
            count = parseInt(entry.value, 10) + 1;
        }
        const ttl = entry ? (entry.expiresAt - Date.now()) / 1000 : 300;
        await this.set(key, count.toString(), Math.max(ttl, 1));
        return count;
    }
    sweepExpiredKeys() {
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
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CacheService);
//# sourceMappingURL=cache.service.js.map
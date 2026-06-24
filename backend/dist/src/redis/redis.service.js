"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client = null;
    providerType = 'memory';
    fallbackTriggered = false;
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
            this.client = new ioredis_1.default({
                host,
                port,
                connectTimeout: 2000,
                lazyConnect: true,
                maxRetriesPerRequest: 0,
                retryStrategy: (times) => {
                    if (times >= 3) {
                        this.triggerFallback();
                        return null;
                    }
                    return 500;
                },
            });
            this.client.on('error', (err) => {
                this.triggerFallback();
            });
            await this.client.connect();
            this.providerType = 'redis';
            this.logger.log(`Connected to Redis at ${host}:${port}`);
        }
        catch (err) {
            this.triggerFallback();
        }
    }
    triggerFallback() {
        if (!this.fallbackTriggered) {
            this.fallbackTriggered = true;
            this.providerType = 'memory';
            this.logger.warn('Redis unavailable. Falling back to in-memory cache.');
            if (this.client) {
                try {
                    this.client.disconnect();
                }
                catch (e) {
                }
            }
        }
    }
    onModuleDestroy() {
        if (this.client) {
            try {
                this.client.disconnect();
            }
            catch (e) {
            }
        }
    }
    getProviderType() {
        return this.providerType;
    }
    getClient() {
        return this.providerType === 'redis' ? this.client : null;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map
import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get('cache')
  getCacheStatus() {
    return {
      cache: this.redisService.getProviderType(),
    };
  }
}

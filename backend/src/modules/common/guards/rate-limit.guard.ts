import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier = this.getIdentifier(request);
    const limit = this.configService.get('RATE_LIMIT', 100);
    const window = this.configService.get('RATE_LIMIT_WINDOW', 60); // seconds

    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, window);
    }

    if (current > limit) {
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private getIdentifier(request: any): string {
    // Use user ID if authenticated, otherwise use IP address
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }
    return `ip:${request.ip}`;
  }
}

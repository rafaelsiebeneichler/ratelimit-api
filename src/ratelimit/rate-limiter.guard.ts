import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request } from 'express';
import { CacheService } from './cache.service';
import { User } from '../auth/user.interface';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private rateLimiters: Map<string, RateLimiterMemory> = new Map();

  constructor(
    private reflector: Reflector,
    private cacheService: CacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user: User = request.user as User;

    if (!user) {
      throw new HttpException('User not found in request', HttpStatus.UNAUTHORIZED);
    }

    const userId = user.userId;
    const route = request.route.path;
    const rateLimiterKey = `rate-limiter-${userId}-${route}`;

    let rateLimiter = this.rateLimiters.get(rateLimiterKey);

    if (!rateLimiter) {
      const userRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${userId}`);
      const routeRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${route}`);

      rateLimiter = new RateLimiterMemory({
        points: userRateLimit?.points || routeRateLimit?.points || 10,
        duration: userRateLimit?.duration || routeRateLimit?.duration || 60,
      });

      this.rateLimiters.set(rateLimiterKey, rateLimiter);
    }

    try {
      await rateLimiter.consume(userId); // Use o ID do usuário como chave
      return true;
    } catch (rejRes) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
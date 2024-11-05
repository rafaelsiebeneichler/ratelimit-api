import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response } from 'express';
import { CacheService } from './cache.service';
import { User } from '../auth/user.interface';

interface RateLimiterConfig {
  rateLimiter: RateLimiterMemory;
  points: number;
  duration: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private rateLimiters: Map<string, RateLimiterConfig> = new Map();

  constructor(
    private reflector: Reflector,
    private cacheService: CacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const user: User = request.user as User;

    if (!user) {
      throw new HttpException('User not found in request', HttpStatus.UNAUTHORIZED);
    }

    const userId = user.userId;
    const route = request.route.path;
    const rateLimiterKey = `rate-limiter-${userId}-${route}`;

    let rateLimiterConfig = this.rateLimiters.get(rateLimiterKey);

    if (!rateLimiterConfig) {
      const userRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${userId}`);
      const routeRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${route}`);

      const points = userRateLimit?.points || routeRateLimit?.points || 10;
      const duration = userRateLimit?.duration || routeRateLimit?.duration || 60;

      const rateLimiter = new RateLimiterMemory({
        points,
        duration,
      });

      rateLimiterConfig = { rateLimiter, points, duration };
      this.rateLimiters.set(rateLimiterKey, rateLimiterConfig);
    }

    try {
      const rateLimiterRes = await rateLimiterConfig.rateLimiter.consume(userId); // Use o ID do usuário como chave
      response.setHeader('RateLimit-Limit', rateLimiterConfig.points);
      response.setHeader('RateLimit-Remaining', rateLimiterRes.remainingPoints);
      response.setHeader('RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

      // Adicione as informações adicionais no corpo da resposta
      request.rateLimitInfo = {
        success: true,
        limit: rateLimiterConfig.points,
        remaining: rateLimiterRes.remainingPoints,
        reset: new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      };

      return true;
    } catch (rejRes) {
      response.setHeader('RateLimit-Limit', rateLimiterConfig.points);
      response.setHeader('RateLimit-Remaining', 0);
      response.setHeader('RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).toISOString());
      response.setHeader('Retry-After', Math.ceil(rejRes.msBeforeNext / 1000));

      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        limit: rateLimiterConfig.points,
        remaining: 0,
        reset: new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
      });

      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
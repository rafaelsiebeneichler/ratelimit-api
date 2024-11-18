import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { Request, Response } from 'express';
import { CacheService } from './cache.service';
import { User } from '../auth/user.interface';

const DEFAULT_RATE_LIMIT_POINTS = 10;
const DEFAULT_RATE_LIMIT_DURATION = 60;

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
    const method = request.method; // Obter o método HTTP
    const rateLimiterKey = `rate-limiter-${userId}-${route}-${method}`;

    let rateLimiterConfig = this.rateLimiters.get(rateLimiterKey);

    if (!rateLimiterConfig) {
      const userRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${userId}`);
      const routeRateLimit = this.cacheService.get<{ points: number; duration: number }>(`rate-limit-${route}`);

      const points = userRateLimit?.points || routeRateLimit?.points || DEFAULT_RATE_LIMIT_POINTS;
      const duration = userRateLimit?.duration || routeRateLimit?.duration || DEFAULT_RATE_LIMIT_DURATION;

      const rateLimiter = new RateLimiterMemory({
        points,
        duration,
      });

      rateLimiterConfig = { rateLimiter, points, duration };
      this.rateLimiters.set(rateLimiterKey, rateLimiterConfig);
    }

    try {
      // Tente consumir um ponto do rate limiter
      const rateLimiterRes = await rateLimiterConfig.rateLimiter.consume(userId);

      this.setRateLimitHeaders(response, rateLimiterConfig, rateLimiterRes);
      this.setRateLimitInfoInRequest(request, rateLimiterConfig, rateLimiterRes);

      return true;
    } catch (rejRes) {
      console.log('requisition rejected by rate limit', rejRes);
      // Caso não haja pontos suficientes para consumir, retorne erro 429
      this.setRateLimitHeadersWithRetry(response, rateLimiterConfig, rejRes);

      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        limit: rateLimiterConfig.points,
        remaining: 0,
        reset: new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
      });

      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private setRateLimitHeaders(response: Response, rateLimiterConfig: RateLimiterConfig, rateLimiterRes: RateLimiterRes) {
    response.setHeader('RateLimit-Limit', rateLimiterConfig.points);
    response.setHeader('RateLimit-Remaining', rateLimiterRes.remainingPoints);
    response.setHeader('RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
  }

  private setRateLimitHeadersWithRetry(response: Response, rateLimiterConfig: RateLimiterConfig, rateLimiterRes: RateLimiterRes) {
    this.setRateLimitHeaders(response, rateLimiterConfig, rateLimiterRes);
    response.setHeader('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000));
  }

  private setRateLimitInfoInRequest(request: Request, rateLimiterConfig: RateLimiterConfig, rateLimiterRes: any) {
    request.rateLimitInfo = {
      success: true,
      limit: rateLimiterConfig.points,
      remaining: rateLimiterRes.remainingPoints,
      reset: new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
    };
  }
    
}
import { Controller, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RateLimiterGuard } from './ratelimit/rate-limiter.guard';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RateLimiterGuard)
  @Get('protected')
  getProtected(@Req() request: Request, @Res() response: Response) {
    const rateLimitInfo = request.rateLimitInfo;
    response.status(HttpStatus.OK).json({
      success: true,
      message: 'This is a protected route',
      ...rateLimitInfo,
    });
  }
}
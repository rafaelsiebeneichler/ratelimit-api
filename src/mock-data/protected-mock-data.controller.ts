import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { MockDataService } from './mock-data.service';
import { MockData } from './mock-data.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimiterGuard } from '../ratelimit/rate-limiter.guard';
import { Request, Response } from 'express';

@Controller('protected-mock-data')
export class ProtectedMockDataController {
  constructor(private readonly mockDataService: MockDataService) {}

  @UseGuards(JwtAuthGuard, RateLimiterGuard)
  @Post()
  async create(@Req() request: Request, @Res() response: Response, @Body() mockData: Partial<MockData>): Promise<void> {
    const createdData = await this.mockDataService.create(mockData);
    const rateLimitInfo = request.rateLimitInfo;
    response.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Data created successfully',
      data: createdData,
      ...rateLimitInfo,
    });
  }

  @UseGuards(JwtAuthGuard, RateLimiterGuard)
  @Get()
  async findAll(@Req() request: Request, @Res() response: Response, @Query('offset') offset: number, @Query('limit') limit: number, @Query('order') order: 'asc' | 'desc' = 'desc'): Promise<void> {
    const data = await this.mockDataService.findAll(offset, limit, order);
    const rateLimitInfo = request.rateLimitInfo;
    response.status(HttpStatus.OK).json({
      success: true,
      message: 'Data retrieved successfully',
      data: data,
      ...rateLimitInfo,
    });
  }

  @UseGuards(JwtAuthGuard, RateLimiterGuard)
  @Get(':id')
  async findOne(@Req() request: Request, @Res() response: Response, @Param('id') id: number): Promise<void> {
    const data = await this.mockDataService.findOne(id);
    const rateLimitInfo = request.rateLimitInfo;
    response.status(HttpStatus.OK).json({
      success: true,
      message: 'Data retrieved successfully',
      data: data,
      ...rateLimitInfo,
    });
  }

  @UseGuards(JwtAuthGuard, RateLimiterGuard)
  @Get(':account/summary')
  async getSummary(@Req() request: Request, @Res() response: Response, @Param('account') account: number, @Query('period') period: 'month' | 'year'): Promise<void> {
    const summary = await this.mockDataService.getSummary(account, period);
    const rateLimitInfo = request.rateLimitInfo;
    response.status(HttpStatus.OK).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: summary,
      ...rateLimitInfo,
    });
  }
}
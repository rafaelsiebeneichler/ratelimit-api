import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MockDataService } from './mock-data.service';
import { MockData } from './mock-data.model';

@Controller('mock-data')
export class MockDataController {
  constructor(private readonly mockDataService: MockDataService) {}

  @Post()
  async create(@Body() mockData: Partial<MockData>): Promise<MockData> {
    return this.mockDataService.create(mockData);
  }

  @Get()
  async findAll(@Query('offset') offset: number, @Query('limit') limit: number, @Query('order') order: 'asc' | 'desc' = 'desc'): Promise<MockData[]> {
    return this.mockDataService.findAll(offset, limit, order);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<MockData> {
    return this.mockDataService.findOne(id);
  }

  @Get(':account/summary')
  async getSummary(@Param('account') account: number, @Query('period') period: 'month' | 'year'): Promise<void> {
    return this.mockDataService.getSummary(account, period);
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MockData } from './mock-data.model';
import { ValidationError, Op, Sequelize } from 'sequelize';

@Injectable()
export class MockDataService {
  constructor(
    @InjectModel(MockData)
    private readonly mockDataModel: typeof MockData,
  ) {}

  async create(mockData: Partial<MockData>): Promise<MockData> {
    try {
      return await this.mockDataModel.create(mockData);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  async findAll(offset: number, limit: number, order: 'asc' | 'desc' = 'desc'): Promise<MockData[]> {
    return this.mockDataModel.findAll({
      offset,
      limit,
      order: [['date', order]],
    });
  }

  async findOne(id: number): Promise<MockData> {
    const mockData = await this.mockDataModel.findOne({
      where: {
        id,
      },
    });
    if (!mockData) {
      throw new NotFoundException(`MockData with id ${id} not found`);
    }
    return mockData;
  }

  async getSummary(account: number, period: 'month' | 'year'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else {
      throw new BadRequestException('Invalid period. Use "month" or "year".');
    }
    await this.mockDataModel.sequelize?.query('SELECT pg_sleep(5)');

    const results = await this.mockDataModel.findAll({
      where: {
        account,
        date: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        'account',
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN ind_dc = 'D' THEN value ELSE -value END`)), 'totalValue'],
      ],
      group: ['account'],
    });

    if (results.length === 0) {
      throw new NotFoundException(`No data found for account ${account} in the specified period.`);
    }

    return results[0];
  }
}
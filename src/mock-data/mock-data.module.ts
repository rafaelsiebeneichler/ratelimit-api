import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MockData } from './mock-data.model';
import { MockDataService } from './mock-data.service';
import { MockDataController } from './mock-data.controller';
import { ProtectedMockDataController } from './protected-mock-data.controller';
import { AuthModule } from '../auth/auth.module';
import { RateLimitModule } from '../ratelimit/ratelimit.module';

@Module({
  imports: [
    SequelizeModule.forFeature([MockData]),
    AuthModule,
    RateLimitModule,
  ],
  providers: [MockDataService],
  controllers: [MockDataController, ProtectedMockDataController],
})
export class MockDataModule {}
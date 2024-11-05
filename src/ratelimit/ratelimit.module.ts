import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RateLimiterGuard } from './rate-limiter.guard';
import { AuthModule } from '../auth/auth.module'; // Importe o AuthModule

@Module({
  imports: [AuthModule], // Adicione o AuthModule às importações
  providers: [CacheService, RateLimiterGuard],
  exports: [CacheService, RateLimiterGuard],
})
export class RateLimitModule {}
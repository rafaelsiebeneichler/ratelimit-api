import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RateLimitModule } from './ratelimit/ratelimit.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { MockDataModule } from './mock-data/mock-data.module';
import { TimeoutInterceptor } from './utils/timeout.interceptor';
import { TimeoutValueProvider } from './utils/timeout.provider';
import { APP_INTERCEPTOR } from '@nestjs/core';


@Module({
  imports: [
    AuthModule,
    RateLimitModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'mydatabase',
      autoLoadModels: true,
      synchronize: true,
      logging: false, // Desativar logs de consultas
      dialectOptions: {
        statement_timeout: 15000, // Timeout de 15 segundos
      },
    }),
    MockDataModule,
  ],
  controllers: [AppController],
  providers: [AppService,  
    TimeoutValueProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
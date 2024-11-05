import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { CacheService } from '../ratelimit/cache.service';

@Module({
  imports: [
    PassportModule.register({ session: false }), // Desativa o uso de sessões
    JwtModule.register({
      secret: 'SECRET_KEY', // Substitua por uma chave secreta mais segura
      signOptions: { expiresIn: '6000s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, CacheService],
  controllers: [AuthController],
  exports: [AuthService], 
})
export class AuthModule {}
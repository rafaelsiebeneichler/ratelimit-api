import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.interface';
import { CacheService } from '../ratelimit/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService
  ) {}

  async login(user: User) {
    const payload = { username: user.username, sub: user.userId };
    // Configurar limites personalizados para o usuário
    this.cacheService.set(`rate-limit-${user.userId}`, { points: 5, duration: 60 }); // Exemplo de configuração de limite personalizado

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    // Adicione a lógica de validação do usuário aqui
    const user: User = { userId: 1, username: 'test', password: 'test' }; // Exemplo de usuário
    if (user && user.username === username && user.password === pass) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
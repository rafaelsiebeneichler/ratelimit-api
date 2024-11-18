import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.interface';
import { CacheService } from '../ratelimit/cache.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as users from './users.json'; 

@Injectable()
export class AuthService {
  // private users: User[];
  private users: User[] = users;

  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService
  ) {

  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.userId };
    // Configurar limites personalizados para o usuário
    this.cacheService.set(`rate-limit-${user.userId}`, { points: 5, duration: 60 }); // Exemplo de configuração de limite personalizado

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    // Criptografar a senha recebida usando MD5
    const encryptedPassword = crypto.createHash('md5').update(pass).digest('hex');

    // Encontrar o usuário no arquivo JSON
    const user = this.users.find(u => u.username === username && u.password === encryptedPassword);
    if (user) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }
}
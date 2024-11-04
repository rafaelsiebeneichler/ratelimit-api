import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    // Adicione a lógica de validação do usuário aqui
    const user = { userId: 1, username: 'test', password: 'test' }; // Exemplo de usuário
    if (user && user.username === username && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
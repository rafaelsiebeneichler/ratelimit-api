// auth/user.interface.ts
export interface User {
    userId: number | string;
    username: string;
    password?: string; // Opcional, caso você não queira expor a senha em todos os lugares
  }
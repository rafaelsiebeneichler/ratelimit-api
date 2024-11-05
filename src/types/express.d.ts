import { Request } from 'express';

declare module 'express' {
  export interface Request {
    rateLimitInfo?: {
      success: boolean;
      limit: number;
      remaining: number;
      reset: string;
    };
  }
}
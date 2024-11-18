import { Provider } from '@nestjs/common';

export const TIMEOUT_VALUE = 30000; // Timeout de 30 segundos

export const TimeoutValueProvider: Provider = {
  provide: 'TIMEOUT_VALUE',
  useValue: TIMEOUT_VALUE,
};
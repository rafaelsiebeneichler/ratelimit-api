import { Provider } from '@nestjs/common';

export const TIMEOUT_VALUE = 15000; // Timeout de 15 segundos

export const TimeoutValueProvider: Provider = {
  provide: 'TIMEOUT_VALUE',
  useValue: TIMEOUT_VALUE,
};
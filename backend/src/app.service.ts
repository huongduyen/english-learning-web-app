import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus() {
    return {
      status: 'ok',
      service: 'English Learning API',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}

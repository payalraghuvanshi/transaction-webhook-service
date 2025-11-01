import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Application-level controller for health checks
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //Returns service health status
  @Get()
  getHealthCheck() {
    return {
      status: 'HEALTHY',
      current_time: new Date().toISOString(),
    };
  }
}

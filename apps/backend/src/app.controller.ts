import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClerkGuard } from './auth/clerk.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get("/health")
  @UseGuards(ClerkGuard)
  getHealth(): string {
    return this.appService.getHealth();
  }

}

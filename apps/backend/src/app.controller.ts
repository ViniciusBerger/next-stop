import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaekGuard } from './auth/firebase.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get("/health")
  @UseGuards(FirebaekGuard)
  getHealth(): string {
    return this.appService.getHealth();
  }

}

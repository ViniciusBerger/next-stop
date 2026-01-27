import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseGuard } from './auth/firebase.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('/health')
  @UseGuards(FirebaseGuard)
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Get('/places')
  getPlaces(
    @Query('location') location?: string,
    @Query('type') type?: string,
    @Query('budget') budget?: string,
  ) {
    return this.appService.getFilteredPlaces({
      location,
      type,
      budget,
    });
  }
}
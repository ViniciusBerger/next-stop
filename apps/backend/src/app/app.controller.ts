import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from '../common/firebase/firebase.auth.guard';
import { Roles } from '../common/authorization/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  getHello(): any {
    return this.appService.getHello();
  }


  @Get("/health")
  @UseGuards(FirebaseAuthGuard)
  @Roles('admin')
  getHealth(): string {
    return this.appService.getHealth();
  }

}

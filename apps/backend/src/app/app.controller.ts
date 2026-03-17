import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from '../common/firebase/firebase.auth.guard';
import { Roles } from '../common/authorization/roles.decorator';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()

export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message returned' })
  getHello(): any {
    return this.appService.getHello();
  }

  @Get("/health")
  @UseGuards(FirebaseAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API health returned' })
  getHealth(): string {
    return this.appService.getHealth();
  }

}
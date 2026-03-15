import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../common/roles.decorator';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')

@Controller()

export class AppController {

constructor(private readonly appService: AppService) {}

@Get()

@UseGuards(AuthGuard)

@ApiOperation({ summary: 'Get welcome message' })

@ApiResponse({ status: 200, description: 'Welcome message returned' })

getHello(): any {

return this.appService.getHello();

}

@Get("/health")

@UseGuards(AuthGuard)

@Roles('admin')

@ApiOperation({ summary: 'Check API health status' })

@ApiResponse({ status: 200, description: 'API health returned' })

getHealth(): string {

return this.appService.getHealth();

}

}
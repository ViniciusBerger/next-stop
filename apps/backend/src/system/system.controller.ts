import { Controller, Get, Patch, Body } from "@nestjs/common";
import { SystemService } from "./system.service";

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')

@Controller("system-settings")

export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()

  @ApiOperation({ summary: 'Get system settings' })

  @ApiResponse({ status: 200, description: 'System settings returned' })

  getAll() {
    return this.systemService.getAll();
  }

  @Patch()

  @ApiOperation({ summary: 'Update system settings' })

  @ApiResponse({ status: 200, description: 'System settings updated' })

  update(@Body() body: { key: string; value: string; admin: string }) {
    return this.systemService.update(body.key, body.value, body.admin);
  }
}
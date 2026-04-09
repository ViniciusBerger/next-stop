import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SystemConfigService } from '../service/system-config.service';

@Controller('system')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('config')
  async getConfig() {
    return this.systemConfigService.getConfig();
  }

  @Patch('config')
  async updateConfig(@Body() body: { key: string; value: boolean }) {
    return this.systemConfigService.updateConfig(body.key, body.value);
  }
}

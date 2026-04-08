import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SystemConfigService } from '../service/system-config.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { RoleGuard } from '../../common/authorization/role.guard';
import { Roles } from '../../common/authorization/roles.decorator';

@Controller('system')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('config')
  async getConfig() {
    return this.systemConfigService.getConfig();
  }

  @Patch('config')
  @UseGuards(FirebaseAuthGuard, RoleGuard)
  @Roles('admin')
  async updateConfig(@Body() body: { key: string; value: boolean }) {
    return this.systemConfigService.updateConfig(body.key, body.value);
  }
}

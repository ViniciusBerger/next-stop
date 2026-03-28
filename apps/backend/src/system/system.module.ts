import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemConfig, SystemConfigSchema } from './schemas/system-config.schema';
import { SystemConfigService } from './service/system-config.service';
import { SystemConfigController } from './controller/system-config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemConfig.name, schema: SystemConfigSchema },
    ]),
  ],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
})
export class SystemModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SystemSetting, SystemSettingSchema } from "./schemas/system-setting.schema";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
    ]),
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
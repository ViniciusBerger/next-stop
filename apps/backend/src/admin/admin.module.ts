import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { EventModule } from '../events/event.module';

@Module({
  imports: [UserModule, EventModule],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ReportService } from '../reports/service/report.service';
import { EventService } from 'src/events/service/event.service';
import { UserService } from 'src/user/service/user.service';

/**
 * Admin Module
 * manage dependencies to be imported and exported on this module. 
 * such import services or export controller
 */
@Module({
  imports: [ReportService, EventService, UserService],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class ReportModule {}
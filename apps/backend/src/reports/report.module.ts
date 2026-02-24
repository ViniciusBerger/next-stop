import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './controller/report.controller';
import { ReportService } from './service/report.service';
import { ReportRepository } from './repository/report.repository';
import { Report, reportSchema } from './schema/report.schema';

/**
 * Report Module
 * Manages user feedback and issue reports
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: reportSchema }]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
  exports: [ReportService],
})
export class ReportModule {}
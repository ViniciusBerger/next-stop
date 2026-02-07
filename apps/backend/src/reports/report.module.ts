import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Report, reportSchema } from './schema/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: reportSchema }]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService], // Export for use in other modules if needed
})
export class ReportModule {}
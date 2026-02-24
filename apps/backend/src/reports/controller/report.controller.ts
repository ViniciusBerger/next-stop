import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { CreateReportDTO } from '../DTOs/create.report.DTO';
import { GetReportDTO } from '../DTOs/get.report.DTO';
import { plainToInstance } from 'class-transformer';
import { ReportResponseDTO } from '../DTOs/report.response.DTO';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * User creates a report/feedback
   * POST /reports
   */
  @Post()
  async createReport(@Body() createReportDTO: CreateReportDTO) {
    const newReport = await this.reportService.createReport(createReportDTO);

    return plainToInstance(ReportResponseDTO, newReport.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin gets all reports with optional filters
   * GET /reports
   * TODO: Add admin authentication middleware
   */
  @Get()
  async getReports(@Query() getReportDTO?: GetReportDTO) {
    const reports = await this.reportService.getAllReports(getReportDTO);

    return reports.map(report =>
      plainToInstance(ReportResponseDTO, report.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Admin gets pending reports count
   * GET /reports/pending/count
   * TODO: Add admin authentication middleware
   */
  @Get('pending/count')
  async getPendingCount() {
    const count = await this.reportService.getPendingCount();
    return { pendingCount: count };
  }

  /**
   * Admin gets a specific report
   * GET /reports/:id
   * TODO: Add admin authentication middleware
   */
  @Get(':id')
  async getReport(@Param('id') id: string) {
    const report = await this.reportService.getReport(id);

    return plainToInstance(ReportResponseDTO, report.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin marks report as completed
   * PUT /reports/:id/complete
   * TODO: Add admin authentication middleware
   */
  @Put(':id/complete')
  async completeReport(@Param('id') id: string) {
    const completedReport = await this.reportService.completeReport(id);

    return plainToInstance(ReportResponseDTO, completedReport.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin deletes a report
   * DELETE /reports/:id
   * TODO: Add admin authentication middleware
   */
  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return await this.reportService.deleteReport(id);
  }
}
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
  UseGuards,
} from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { CreateReportDTO } from '../DTOs/create.report.DTO';
import { GetReportDTO } from '../DTOs/get.report.DTO';
import { plainToInstance } from 'class-transformer';
import { ReportResponseDTO } from '../DTOs/report.response.DTO';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { RoleGuard } from '../../common/authorization/role.guard';
import { Roles } from '../../common/authorization/roles.decorator';

@Controller('reports')
@UseGuards(FirebaseAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * User creates a report/feedback
   * POST /reports
   */
  @Post()
  async createReport(@Body() createReportDTO: CreateReportDTO) {
    const newReport = await this.reportService.createReport(createReportDTO);
    const obj = newReport.toObject();
    obj._id = obj._id.toString();

    return plainToInstance(ReportResponseDTO, obj, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin gets all reports with optional filters
   * GET /reports
   */
  @Get()
  @UseGuards(RoleGuard)
  @Roles('admin')
  async getReports(@Query() getReportDTO?: GetReportDTO) {
    const reports = await this.reportService.getAllReports(getReportDTO);

    return reports.map(report => {
      const obj = report.toObject();
      obj._id = obj._id.toString();
      return plainToInstance(ReportResponseDTO, obj, {
        excludeExtraneousValues: true,
      });
    });
  }

  /**
   * Admin gets pending reports count
   * GET /reports/pending/count
   */
  @Get('pending/count')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async getPendingCount() {
    const count = await this.reportService.getPendingCount();
    return { pendingCount: count };
  }

  /**
   * Admin gets a specific report
   * GET /reports/:id
   */
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async getReport(@Param('id') id: string) {
    const report = await this.reportService.getReport(id);
    const obj = report.toObject();
    obj._id = obj._id.toString();

    return plainToInstance(ReportResponseDTO, obj, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin marks report as completed
   * PUT /reports/:id/complete
   */
  @Put(':id/complete')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async completeReport(@Param('id') id: string) {
    const completedReport = await this.reportService.completeReport(id);
    const obj = completedReport.toObject();
    obj._id = obj._id.toString();

    return plainToInstance(ReportResponseDTO, obj, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Admin deletes a report
   * DELETE /reports/:id
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async deleteReport(@Param('id') id: string) {
    return await this.reportService.deleteReport(id);
  }
}
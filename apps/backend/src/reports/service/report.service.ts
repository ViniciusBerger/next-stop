import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportRepository } from '../repository/report.repository';
import { Report, ReportStatus } from '../schema/report.schema';
import { CreateReportDTO } from '../DTOs/create.report.DTO';
import { GetReportDTO } from '../DTOs/get.report.DTO';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    @InjectModel(Report.name) private readonly reportModel: Model<Report>
  ) {}

  /**
   * Creates a new report/feedback
   */
  async createReport(dto: CreateReportDTO): Promise<Report> {
    const newReport = await this.reportRepository.create(dto as any);

    // Populate before returning
    return await this.reportModel
      .findById(newReport._id)
      .populate('reportedBy', 'username email')
      .exec() as Report;
  }

  /**
   * Retrieves all reports with optional filters
   */
  async getAllReports(dto?: GetReportDTO): Promise<Report[]> {
    const filter: any = {};

    if (dto) {
      if (dto.status) filter.status = dto.status;
      if (dto.type) filter.type = dto.type;
      if (dto.reportedBy) filter.reportedBy = dto.reportedBy;
    }

    const reports = await this.reportRepository.findMany(filter);

    return await this.reportModel
      .find({ _id: { $in: reports.map(r => r._id) } })
      .populate('reportedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retrieves a specific report
   */
  async getReport(reportId: string): Promise<Report> {
    const report = await this.reportModel
      .findById(reportId)
      .populate('reportedBy', 'username email profilePicture')
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Marks report as completed (admin)
   */
  async completeReport(reportId: string): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.COMPLETED;
    report.completedAt = new Date();

    const saved = await this.reportRepository.save(report);

    // Populate before returning
    return await this.reportModel
      .findById(saved._id)
      .populate('reportedBy', 'username email')
      .exec() as Report;
  }

  /**
   * Deletes a report (admin)
   */
  async deleteReport(reportId: string): Promise<{ deleted: boolean; message: string }> {
    const deletedReport = await this.reportRepository.delete({ _id: reportId });

    if (!deletedReport) {
      throw new NotFoundException('Report not found');
    }

    return {
      deleted: true,
      message: 'Report deleted successfully',
    };
  }

  /**
   * Gets pending reports count (admin dashboard)
   */
  async getPendingCount(): Promise<number> {
    return await this.reportRepository.countDocuments({ status: ReportStatus.PENDING });
  }

  /**
   * Gets reports by status (admin)
   */
  async getReportsByStatus(status: string): Promise<Report[]> {
    return await this.reportModel
      .find({ status })
      .populate('reportedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportStatus } from './schema/report.schema';
import { CreateReportDTO } from './DTOs/create.report.DTO';
import { GetReportDTO } from './DTOs/get.report.DTO';

@Injectable()
export class ReportService {
  private reportModel: Model<Report>;

  constructor(@InjectModel(Report.name) reportModelReceived: Model<Report>) {
    this.reportModel = reportModelReceived;
  }

  // CREATE - User creates a report/feedback
  async createReport(createReportDTO: CreateReportDTO): Promise<Report> {
    const newReport = new this.reportModel(createReportDTO);
    return await newReport.save();
  }

  // GET ALL - Admin gets all reports (with optional filters)
  async getAllReports(getReportDTO?: GetReportDTO): Promise<Report[]> {
    const mongoQuery: any = {};

    if (getReportDTO) {
      if (getReportDTO.status) mongoQuery.status = getReportDTO.status;
      if (getReportDTO.type) mongoQuery.type = getReportDTO.type;
      if (getReportDTO.reportedBy) mongoQuery.reportedBy = getReportDTO.reportedBy;
    }

    return await this.reportModel
      .find(mongoQuery)
      .populate('reportedBy', 'username email')
      .sort({ createdAt: -1 }) // Most recent first
      .exec();
  }

  // GET ONE - Admin gets a specific report
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

  // COMPLETE - Admin marks report as completed
  async completeReport(reportId: string): Promise<Report> {
    const report = await this.reportModel.findById(reportId).exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.COMPLETED;
    report.completedAt = new Date();

    return await report.save();
  }

  // DELETE - Admin deletes a report
  async deleteReport(reportId: string): Promise<{ deleted: boolean; message: string }> {
    const deletedReport = await this.reportModel.findByIdAndDelete(reportId).exec();

    if (!deletedReport) {
      throw new NotFoundException('Report not found');
    }

    return {
      deleted: true,
      message: 'Report deleted successfully',
    };
  }

  // HELPER - Get pending reports count (for admin dashboard)
  async getPendingCount(): Promise<number> {
    return await this.reportModel.countDocuments({ status: ReportStatus.PENDING }).exec();
  }

  // HELPER - Get reports by status
  async getReportsByStatus(status: string): Promise<Report[]> {
    return await this.reportModel
      .find({ status })
      .populate('reportedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
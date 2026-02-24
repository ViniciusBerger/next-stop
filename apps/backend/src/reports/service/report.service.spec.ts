import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { ReportRepository } from '../repository/report.repository';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Report, ReportType, ReportStatus } from '../schema/report.schema';

/**
 * ReportService Unit Tests
 * 
 * To run: npm test -- apps/backend/src/reports/service/report.service.spec.ts
 */
describe('ReportService - Unit Test', () => {
  let service: ReportService;
  let repository: ReportRepository;

  const mockReport = {
    _id: 'report_123',
    type: ReportType.FEEDBACK,
    title: 'Great app!',
    description: 'Love the features!',
    reportedBy: 'user_123',
    status: ReportStatus.PENDING,
    createdAt: new Date(),
    toObject: function() { return this; }
  };

  // Mock do ReportModel
  const mockReportModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: ReportRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Report.name),
          useValue: mockReportModel,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    repository = module.get<ReportRepository>(ReportRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createReport', () => {
    it('should create a new report', async () => {
      const createDto = {
        type: ReportType.FEEDBACK,
        title: 'New Feedback',
        description: 'This is great!',
        reportedBy: 'user_new',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockReport as any);
      mockReportModel.findById.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.exec.mockResolvedValue(mockReport);

      const result = await service.createReport(createDto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getAllReports', () => {
    it('should return all reports when no filter provided', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);
      mockReportModel.find.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.sort.mockReturnThis();
      mockReportModel.exec.mockResolvedValue([mockReport]);

      const result = await service.getAllReports();

      expect(result).toHaveLength(1);
      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it('should filter by status', async () => {
      const dto = { status: ReportStatus.PENDING };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);
      mockReportModel.find.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.sort.mockReturnThis();
      mockReportModel.exec.mockResolvedValue([mockReport]);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ status: ReportStatus.PENDING });
    });

    it('should filter by type', async () => {
      const dto = { type: ReportType.ISSUE };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);
      mockReportModel.find.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.sort.mockReturnThis();
      mockReportModel.exec.mockResolvedValue([mockReport]);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ type: ReportType.ISSUE });
    });

    it('should filter by reportedBy', async () => {
      const dto = { reportedBy: 'user_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);
      mockReportModel.find.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.sort.mockReturnThis();
      mockReportModel.exec.mockResolvedValue([mockReport]);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ reportedBy: 'user_specific' });
    });
  });

  describe('getReport', () => {
    it('should return report by ID', async () => {
      mockReportModel.findById.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.exec.mockResolvedValue(mockReport);

      const result = await service.getReport('report_123');

      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      mockReportModel.findById.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.exec.mockResolvedValue(null);

      await expect(service.getReport('ghost_report'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('completeReport', () => {
    it('should mark report as completed', async () => {
      const reportToComplete = { ...mockReport, status: ReportStatus.PENDING };

      jest.spyOn(repository, 'findById').mockResolvedValue(reportToComplete as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...reportToComplete,
        status: ReportStatus.COMPLETED,
        completedAt: new Date(),
        _id: 'report_123',
      } as any);
      mockReportModel.findById.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.exec.mockResolvedValue({
        ...reportToComplete,
        status: ReportStatus.COMPLETED,
      });

      const result = await service.completeReport('report_123');

      expect(result.status).toBe(ReportStatus.COMPLETED);
    });

    it('should throw NotFoundException if report not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.completeReport('ghost_report'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteReport', () => {
    it('should delete report and return message', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(mockReport as any);

      const result = await service.deleteReport('report_123');

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('deleted');
      expect(repository.delete).toHaveBeenCalledWith({ _id: 'report_123' });
    });

    it('should throw NotFoundException if report not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      await expect(service.deleteReport('ghost_report'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getPendingCount', () => {
    it('should return count of pending reports', async () => {
      jest.spyOn(repository, 'countDocuments').mockResolvedValue(5);

      const result = await service.getPendingCount();

      expect(result).toBe(5);
      expect(repository.countDocuments).toHaveBeenCalledWith({ status: ReportStatus.PENDING });
    });
  });

  describe('getReportsByStatus', () => {
    it('should return reports filtered by status', async () => {
      mockReportModel.find.mockReturnThis();
      mockReportModel.populate.mockReturnThis();
      mockReportModel.sort.mockReturnThis();
      mockReportModel.exec.mockResolvedValue([mockReport, mockReport]);

      const result = await service.getReportsByStatus(ReportStatus.PENDING);

      expect(result).toHaveLength(2);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { ReportRepository } from '../repository/report.repository';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Report, ReportType, ReportStatus } from '../schema/report.schema';
import { User } from '../../user/user.schema';

/**
 * ReportService Unit Tests
 * 
 * To run: npm test -- apps/backend/src/reports/service/report.service.spec.ts
 */
describe('ReportService - Unit Test', () => {
  let service: ReportService;
  let repository: ReportRepository;
  let mockReportModel: any;
  let mockUserModel: any;

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

  const mockUser = {
    _id: 'user_mongo_id_123',
    firebaseUID: 'firebase_uid_123',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
  mockReportModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
      ...data,
      _id: 'report_123',
      createdAt: new Date(),
    }),
  }));

  mockReportModel.findById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockReport),
  });
  
  mockReportModel.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockReport]),
  });
  
  mockReportModel.countDocuments = jest.fn().mockResolvedValue(5);

  // Mock do UserModel
  mockUserModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    }),
  };

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
      {
        provide: getModelToken(User.name),
        useValue: mockUserModel,
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
        reportedBy: 'firebase_uid_123', // ← Firebase UID
        type: ReportType.FEEDBACK,
        title: 'New Feedback',
        description: 'This is great!',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockReport as any);

      const result = await service.createReport(createDto as any);

      expect(result).toBeDefined();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ firebaseUid: createDto.reportedBy });
    });
  });

  describe('getAllReports', () => {
    it('should return all reports when no filter provided', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);

      const result = await service.getAllReports();

      expect(result).toHaveLength(1);
      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it('should filter by status', async () => {
      const dto = { status: ReportStatus.PENDING };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ status: ReportStatus.PENDING });
    });

    it('should filter by type', async () => {
      const dto = { type: ReportType.ISSUE };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ type: ReportType.ISSUE });
    });

    it('should filter by reportedBy', async () => {
      const dto = { reportedBy: 'user_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReport] as any);

      await service.getAllReports(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ reportedBy: 'user_specific' });
    });
  });

  describe('getReport', () => {
    it('should return report by ID', async () => {
      const result = await service.getReport('report_123');

      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      mockReportModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

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
      
      mockReportModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          ...reportToComplete,
          status: ReportStatus.COMPLETED,
        }),
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
      mockReportModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReport, mockReport]),
      });

      const result = await service.getReportsByStatus(ReportStatus.PENDING);

      expect(result).toHaveLength(2);
    });
  });
});
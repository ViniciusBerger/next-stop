import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from '../service/report.service';
import { NotFoundException } from '@nestjs/common';

/**
 * ReportController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/reports/controller/report.controller.spec.ts
 */
describe('ReportController - Unit Test', () => {
  let controller: ReportController;
  let service: ReportService;

  const mockReport = {
    _id: 'report_123',
    type: 'feedback',
    title: 'Great app!',
    description: 'Love the features!',
    reportedBy: 'user_123',
    status: 'pending',
    createdAt: new Date(),
    toObject: function() { return this; }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: {
            createReport: jest.fn(),
            getAllReports: jest.fn(),
            getReport: jest.fn(),
            completeReport: jest.fn(),
            deleteReport: jest.fn(),
            getPendingCount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    it('should create a new report', async () => {
      const createDto = {
        type: 'feedback',
        title: 'New Feedback',
        description: 'This is great!',
        reportedBy: 'user_new',
      } as any;

      jest.spyOn(service, 'createReport').mockResolvedValue(mockReport as any);

      const result = await controller.createReport(createDto);

      expect(result).toBeDefined();
      expect(service.createReport).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getReports', () => {
    it('should return all reports', async () => {
      jest.spyOn(service, 'getAllReports').mockResolvedValue([mockReport] as any);

      const result = await controller.getReports();

      expect(result).toHaveLength(1);
      expect(service.getAllReports).toHaveBeenCalled();
    });

    it('should filter reports by status', async () => {
      const dto = { status: 'pending' } as any;
      jest.spyOn(service, 'getAllReports').mockResolvedValue([mockReport] as any);

      const result = await controller.getReports(dto);

      expect(result).toBeDefined();
      expect(service.getAllReports).toHaveBeenCalledWith(dto);
    });
  });

  describe('getPendingCount', () => {
    it('should return pending reports count', async () => {
      jest.spyOn(service, 'getPendingCount').mockResolvedValue(5);

      const result = await controller.getPendingCount();

      expect(result.pendingCount).toBe(5);
      expect(service.getPendingCount).toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('should return report by id', async () => {
      jest.spyOn(service, 'getReport').mockResolvedValue(mockReport as any);

      const result = await controller.getReport('report_123');

      expect(result).toBeDefined();
      expect(service.getReport).toHaveBeenCalledWith('report_123');
    });

    it('should throw NotFoundException if report not found', async () => {
      jest.spyOn(service, 'getReport').mockRejectedValue(new NotFoundException());

      await expect(controller.getReport('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('completeReport', () => {
    it('should mark report as completed', async () => {
      jest.spyOn(service, 'completeReport').mockResolvedValue(mockReport as any);

      const result = await controller.completeReport('report_123');

      expect(result).toBeDefined();
      expect(service.completeReport).toHaveBeenCalledWith('report_123');
    });
  });

  describe('deleteReport', () => {
    it('should delete report', async () => {
      const deleteResult = { deleted: true, message: 'Report deleted' };

      jest.spyOn(service, 'deleteReport').mockResolvedValue(deleteResult);

      const result = await controller.deleteReport('report_123');

      expect(result.deleted).toBe(true);
      expect(service.deleteReport).toHaveBeenCalledWith('report_123');
    });
  });
});
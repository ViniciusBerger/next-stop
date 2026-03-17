import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportRepository } from './report.repository';
import { Report, reportSchema, ReportType, ReportStatus } from '../schema/report.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * ReportRepository Integration Tests
 * 
 * To run: npm test -- apps/backend/src/reports/repository/report.repository.spec.ts
 */
describe('ReportRepository - Integration', () => {
  let repository: ReportRepository;
  let reportModel: Model<Report>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: Report.name, schema: reportSchema }]),
      ],
      providers: [ReportRepository],
    }).compile();

    repository = module.get<ReportRepository>(ReportRepository);
    reportModel = module.get<Model<Report>>(getModelToken(Report.name));
  }, 60000);

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (reportModel) {
      await reportModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create() -> should persist a new report', async () => {
    const reportData = {
      type: ReportType.FEEDBACK,
      title: 'Great app!',
      description: 'I love this app, keep up the good work!',
      reportedBy: 'user_001',
    };

    const result = await repository.create(reportData as any);

    expect(result).toBeDefined();
    expect(result.type).toBe(ReportType.FEEDBACK);
    expect(result.title).toBe('Great app!');
    expect(result.status).toBe(ReportStatus.PENDING);
  });

  it('create() -> should create report with reported item', async () => {
    const reportData = {
      type: ReportType.ISSUE,
      title: 'Inappropriate content',
      description: 'This review contains offensive language',
      reportedBy: 'user_002',
      reportedItem: {
        itemType: 'Review',
        itemId: 'review_123',
      },
    };

    const result = await repository.create(reportData as any);

    expect(result).toBeDefined();
    expect(result.reportedItem).toBeDefined();
    expect(result.reportedItem?.itemType).toBe('Review');
  });

  it('findById() -> should retrieve report by ID', async () => {
    const created = await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Suggestion',
      description: 'Add dark mode please!',
      reportedBy: 'user_003',
    });

    const result = await repository.findById(created._id.toString());

    expect(result).toBeDefined();
    expect(result?.title).toBe('Suggestion');
  });

  it('findMany() -> should retrieve all reports', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Report A',
      description: 'Description A',
      reportedBy: 'user_A',
    });
    await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Report B',
      description: 'Description B',
      reportedBy: 'user_B',
    });

    const result = await repository.findMany({});

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by status', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Pending Report',
      description: 'Desc',
      reportedBy: 'user_1',
      status: ReportStatus.PENDING,
    });
    await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Completed Report',
      description: 'Desc',
      reportedBy: 'user_2',
      status: ReportStatus.COMPLETED,
      completedAt: new Date(),
    });

    const result = await repository.findMany({ status: ReportStatus.PENDING });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(ReportStatus.PENDING);
  });

  it('findMany() -> should filter by type', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Feedback 1',
      description: 'Desc',
      reportedBy: 'user_1',
    });
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Feedback 2',
      description: 'Desc',
      reportedBy: 'user_2',
    });
    await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Issue 1',
      description: 'Desc',
      reportedBy: 'user_3',
    });

    const result = await repository.findMany({ type: ReportType.FEEDBACK });

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by reportedBy', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Report 1',
      description: 'Desc',
      reportedBy: 'user_specific',
    });
    await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Report 2',
      description: 'Desc',
      reportedBy: 'user_specific',
    });
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Report 3',
      description: 'Desc',
      reportedBy: 'user_other',
    });

    const result = await repository.findMany({ reportedBy: 'user_specific' });

    expect(result).toHaveLength(2);
  });

  it('save() -> should update report status', async () => {
    const report = await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Bug Report',
      description: 'App crashes on startup',
      reportedBy: 'user_004',
      status: ReportStatus.PENDING,
    });

    report.status = ReportStatus.COMPLETED;
    report.completedAt = new Date();

    const result = await repository.save(report);

    expect(result.status).toBe(ReportStatus.COMPLETED);
    expect(result.completedAt).toBeDefined();
  });

  it('countDocuments() -> should count reports by filter', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Pending 1',
      description: 'Desc',
      reportedBy: 'user_1',
      status: ReportStatus.PENDING,
    });
    await reportModel.create({
      type: ReportType.ISSUE,
      title: 'Pending 2',
      description: 'Desc',
      reportedBy: 'user_2',
      status: ReportStatus.PENDING,
    });
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'Completed',
      description: 'Desc',
      reportedBy: 'user_3',
      status: ReportStatus.COMPLETED,
    });

    const result = await repository.countDocuments({ status: ReportStatus.PENDING });

    expect(result).toBe(2);
  });

  it('delete() -> should remove report', async () => {
    await reportModel.create({
      type: ReportType.FEEDBACK,
      title: 'To Be Deleted',
      description: 'Desc',
      reportedBy: 'user_delete',
    });

    const result = await repository.delete({ reportedBy: 'user_delete' });

    expect(result).toBeDefined();
    expect(result?.title).toBe('To Be Deleted');

    const findAgain = await reportModel.findOne({ reportedBy: 'user_delete' });
    expect(findAgain).toBeNull();
  });

  it('findById() -> should return null if report not found', async () => {
    const result = await repository.findById('507f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });

  it('findOne() -> should return null if report not found', async () => {
    const result = await repository.findOne({ reportedBy: 'ghost_user' });
    expect(result).toBeNull();
  });

  it('delete() -> should return null if report not found', async () => {
    const result = await repository.delete({ reportedBy: 'nonexistent' });
    expect(result).toBeNull();
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from '../service/announcement.service';

/**
 * AnnouncementController Unit Tests
 *
 * To run: npm test -- announcements/controller/announcement.controller.spec.ts
 */
describe('AnnouncementController - Unit Test', () => {
  let controller: AnnouncementController;
  let service: AnnouncementService;

  const mockAnnouncement = {
    _id: 'ann_123',
    title: 'Server Maintenance',
    message: 'Scheduled downtime this weekend',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [
        {
          provide: AnnouncementService,
          useValue: {
            create: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnnouncementController>(AnnouncementController);
    service = module.get<AnnouncementService>(AnnouncementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an announcement', async () => {
      const body = { title: 'Server Maintenance', message: 'Scheduled downtime this weekend' };
      jest.spyOn(service, 'create').mockResolvedValue(mockAnnouncement as any);

      const result = await controller.create(body);

      expect(result).toEqual(mockAnnouncement);
      expect(service.create).toHaveBeenCalledWith('Server Maintenance', 'Scheduled downtime this weekend');
    });
  });

  describe('getAll', () => {
    it('should return all announcements', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([mockAnnouncement] as any);

      const result = await controller.getAll();

      expect(result).toHaveLength(1);
      expect(service.getAll).toHaveBeenCalled();
    });

    it('should return empty array when no announcements', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnnouncementService } from './announcement.service';
import { Announcement } from '../schemas/announcement.schema';
import { User } from '../../user/schemas/user.schema';

/**
 * AnnouncementService Unit Tests
 *
 * To run: npm test -- announcements/service/announcement.service.spec.ts
 */
describe('AnnouncementService - Unit Test', () => {
  let service: AnnouncementService;
  let announcementModel: any;
  let userModel: any;

  const mockAnnouncement = {
    _id: 'ann_123',
    title: 'New Feature',
    message: 'Check out the new events page!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock global fetch for push notification calls
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    announcementModel = {
      create: jest.fn(),
      find: jest.fn(),
    };

    userModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        { provide: getModelToken(Announcement.name), useValue: announcementModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an announcement and send push notifications', async () => {
      announcementModel.create.mockResolvedValue(mockAnnouncement);
      userModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([
          { expoPushToken: 'ExponentPushToken[abc]' },
          { expoPushToken: 'ExponentPushToken[def]' },
        ]),
      });

      const result = await service.create('New Feature', 'Check out the new events page!');

      expect(result).toEqual(mockAnnouncement);
      expect(announcementModel.create).toHaveBeenCalledWith({
        title: 'New Feature',
        message: 'Check out the new events page!',
      });
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should not call push API when no users have tokens', async () => {
      announcementModel.create.mockResolvedValue(mockAnnouncement);
      userModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await service.create('Title', 'Message');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return announcements sorted by newest first', async () => {
      announcementModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockAnnouncement]),
        }),
      });

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(announcementModel.find).toHaveBeenCalled();
    });

    it('should limit to 20 results', async () => {
      const limitMock = jest.fn().mockResolvedValue([]);
      announcementModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: limitMock,
        }),
      });

      await service.getAll();

      expect(limitMock).toHaveBeenCalledWith(20);
    });
  });
});

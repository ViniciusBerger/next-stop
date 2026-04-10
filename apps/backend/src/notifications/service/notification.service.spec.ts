import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationType } from '../schema/notification.schema';

/**
 * NotificationService Unit Tests
 *
 * To run: npm test -- notifications/service/notification.service.spec.ts
 */
describe('NotificationService - Unit Test', () => {
  let service: NotificationService;
  let repo: NotificationRepository;

  const mockNotification = {
    _id: 'notif_123',
    recipient: 'user_1',
    sender: 'user_2',
    type: 'friend_request',
    message: 'sent you a friend request',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: {
            create: jest.fn(),
            getByRecipient: jest.fn(),
            getUnreadCount: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repo = module.get<NotificationRepository>(NotificationRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a friend request notification', async () => {
      const data = {
        recipient: 'user_1',
        sender: 'user_2',
        type: NotificationType.FRIEND_REQUEST,
        message: 'sent you a friend request',
      };
      jest.spyOn(repo, 'create').mockResolvedValue(mockNotification as any);

      const result = await service.create(data);

      expect(result).toEqual(mockNotification);
      expect(repo.create).toHaveBeenCalledWith(data);
    });

    it('should create an event invite notification with relatedId', async () => {
      const data = {
        recipient: 'user_1',
        sender: 'user_2',
        type: NotificationType.EVENT_INVITE,
        message: 'invited you to Pizza Night',
        relatedId: 'event_123',
      };
      jest.spyOn(repo, 'create').mockResolvedValue({ ...mockNotification, ...data } as any);

      const result = await service.create(data);

      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalledWith(data);
    });

    it('should create a friend accepted notification', async () => {
      const data = {
        recipient: 'user_2',
        sender: 'user_1',
        type: NotificationType.FRIEND_ACCEPTED,
        message: 'accepted your friend request',
      };
      jest.spyOn(repo, 'create').mockResolvedValue({ ...mockNotification, ...data } as any);

      const result = await service.create(data);

      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getByRecipient', () => {
    it('should return notifications for a user', async () => {
      jest.spyOn(repo, 'getByRecipient').mockResolvedValue([mockNotification] as any);

      const result = await service.getByRecipient('user_1');

      expect(result).toHaveLength(1);
      expect(repo.getByRecipient).toHaveBeenCalledWith('user_1');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      jest.spyOn(repo, 'getUnreadCount').mockResolvedValue(3 as any);

      const result = await service.getUnreadCount('user_1');

      expect(result).toBe(3);
      expect(repo.getUnreadCount).toHaveBeenCalledWith('user_1');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const readNotif = { ...mockNotification, read: true };
      jest.spyOn(repo, 'markAsRead').mockResolvedValue(readNotif as any);

      const result = await service.markAsRead('notif_123');

      expect(result.read).toBe(true);
      expect(repo.markAsRead).toHaveBeenCalledWith('notif_123');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read for a user', async () => {
      const updateResult = { modifiedCount: 5 };
      jest.spyOn(repo, 'markAllAsRead').mockResolvedValue(updateResult as any);

      const result = await service.markAllAsRead('user_1');

      expect(result).toEqual(updateResult);
      expect(repo.markAllAsRead).toHaveBeenCalledWith('user_1');
    });
  });
});

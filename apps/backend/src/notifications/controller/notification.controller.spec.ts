import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from '../service/notification.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';

/**
 * NotificationController Unit Tests
 *
 * To run: npm test -- notifications/controller/notification.controller.spec.ts
 */
describe('NotificationController - Unit Test', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotification = {
    _id: 'notif_123',
    recipient: 'user_1',
    sender: { _id: 'user_2', username: 'Jane' },
    type: 'friend_request',
    message: 'sent you a friend request',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: FirebaseAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: NotificationService,
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

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      jest.spyOn(service, 'getByRecipient').mockResolvedValue([mockNotification] as any);

      const result = await controller.getNotifications('user_1');

      expect(result).toHaveLength(1);
      expect(service.getByRecipient).toHaveBeenCalledWith('user_1');
    });

    it('should return empty array when no notifications', async () => {
      jest.spyOn(service, 'getByRecipient').mockResolvedValue([]);

      const result = await controller.getNotifications('user_new');

      expect(result).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      jest.spyOn(service, 'getUnreadCount').mockResolvedValue(5 as any);

      const result = await controller.getUnreadCount('user_1');

      expect(result).toBe(5);
      expect(service.getUnreadCount).toHaveBeenCalledWith('user_1');
    });

    it('should return 0 when no unread', async () => {
      jest.spyOn(service, 'getUnreadCount').mockResolvedValue(0 as any);

      const result = await controller.getUnreadCount('user_1');

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a single notification as read', async () => {
      const readNotif = { ...mockNotification, read: true };
      jest.spyOn(service, 'markAsRead').mockResolvedValue(readNotif as any);

      const result = await controller.markAsRead('notif_123');

      expect(result.read).toBe(true);
      expect(service.markAsRead).toHaveBeenCalledWith('notif_123');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const updateResult = { modifiedCount: 3 };
      jest.spyOn(service, 'markAllAsRead').mockResolvedValue(updateResult as any);

      const result = await controller.markAllAsRead('user_1');

      expect(result).toEqual(updateResult);
      expect(service.markAllAsRead).toHaveBeenCalledWith('user_1');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationRepository } from './notification.repository';
import { Notification } from '../schema/notification.schema';

/**
 * NotificationRepository Unit Tests
 *
 * To run: npm test -- notifications/repository/notification.repository.spec.ts
 */
describe('NotificationRepository - Unit Test', () => {
  let repository: NotificationRepository;
  let model: any;

  const mockNotification = {
    _id: 'notif_123',
    recipient: new Types.ObjectId(),
    sender: new Types.ObjectId(),
    type: 'friend_request',
    message: 'sent you a friend request',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      updateMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: getModelToken(Notification.name), useValue: model },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification with ObjectId conversion', async () => {
      const data = {
        recipient: new Types.ObjectId().toString(),
        sender: new Types.ObjectId().toString(),
        type: 'friend_request',
        message: 'sent you a friend request',
      };
      model.create.mockResolvedValue(mockNotification);

      const result = await repository.create(data);

      expect(result).toEqual(mockNotification);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'friend_request',
          message: 'sent you a friend request',
        }),
      );
    });

    it('should convert relatedId to ObjectId when provided', async () => {
      const relatedId = new Types.ObjectId().toString();
      const data = {
        recipient: new Types.ObjectId().toString(),
        sender: new Types.ObjectId().toString(),
        type: 'event_invite',
        message: 'invited you to an event',
        relatedId,
      };
      model.create.mockResolvedValue(mockNotification);

      await repository.create(data);

      const calledWith = model.create.mock.calls[0][0];
      expect(calledWith.relatedId).toBeInstanceOf(Types.ObjectId);
    });

    it('should leave relatedId undefined when not provided', async () => {
      const data = {
        recipient: new Types.ObjectId().toString(),
        sender: new Types.ObjectId().toString(),
        type: 'friend_accepted',
        message: 'accepted your friend request',
      };
      model.create.mockResolvedValue(mockNotification);

      await repository.create(data);

      const calledWith = model.create.mock.calls[0][0];
      expect(calledWith.relatedId).toBeUndefined();
    });
  });

  describe('getByRecipient', () => {
    it('should find notifications sorted by createdAt desc', async () => {
      model.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockNotification]),
          }),
        }),
      });

      const result = await repository.getByRecipient(new Types.ObjectId().toString());

      expect(result).toHaveLength(1);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications', async () => {
      model.countDocuments.mockResolvedValue(3);

      const result = await repository.getUnreadCount(new Types.ObjectId().toString());

      expect(result).toBe(3);
      expect(model.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ read: false }),
      );
    });

    it('should return 0 when no unread', async () => {
      model.countDocuments.mockResolvedValue(0);

      const result = await repository.getUnreadCount(new Types.ObjectId().toString());

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should set read to true', async () => {
      const readNotif = { ...mockNotification, read: true };
      model.findByIdAndUpdate.mockResolvedValue(readNotif);

      const result = await repository.markAsRead('notif_123');

      expect(result.read).toBe(true);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'notif_123',
        { read: true },
        { new: true },
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for a user', async () => {
      model.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await repository.markAllAsRead(new Types.ObjectId().toString());

      expect(result.modifiedCount).toBe(5);
      expect(model.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ read: false }),
        { read: true },
      );
    });
  });
});

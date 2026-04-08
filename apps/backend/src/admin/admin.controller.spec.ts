import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { EventService } from '../events/service/event.service';
import { UserService } from '../user/service/user.service';
import { FirebaseAuthGuard } from '../common/firebase/firebase.auth.guard';

/**
 * AdminController Unit Tests
 *
 * To run: npm test -- admin/admin.controller.spec.ts
 */
describe('AdminController - Unit Test', () => {
  let controller: AdminController;
  let eventService: EventService;
  let userService: UserService;

  const mockUser = {
    _id: 'user_123',
    firebaseUid: 'fb_123',
    username: 'testuser',
    email: 'test@test.com',
    role: 'user',
    isBanned: false,
    isSuspended: false,
    createdAt: new Date(),
    toObject: function () {
      return { ...this, _id: { toString: () => 'user_123' } };
    },
  };

  const mockEvent = {
    _id: 'event_123',
    name: 'Test Event',
    host: 'user_123',
    toObject: function () {
      return this;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: FirebaseAuthGuard,
          useValue: { verifyToken: jest.fn().mockReturnValue(true) },
        },
        {
          provide: EventService,
          useValue: {
            getAllEvents: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getAll: jest.fn(),
            banUser: jest.fn(),
            unbanUser: jest.fn(),
            suspendUser: jest.fn(),
            unsuspendUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    eventService = module.get<EventService>(EventService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return all users as ModerationUserDTOs', async () => {
      jest.spyOn(userService, 'getAll').mockResolvedValue([
        {
          _id: 'user_123',
          firebaseUid: 'fb_123',
          username: 'testuser',
          email: 'test@test.com',
          role: 'user',
          isBanned: false,
          isSuspended: false,
          createdAt: new Date(),
        },
      ] as any);

      const result = await controller.getUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('username', 'testuser');
      expect(userService.getAll).toHaveBeenCalled();
    });
  });

  describe('banUser', () => {
    it('should ban a user', async () => {
      const bannedUser = {
        ...mockUser,
        isBanned: true,
        toObject: function () {
          return { ...this, _id: { toString: () => 'user_123' } };
        },
      };
      jest.spyOn(userService, 'banUser').mockResolvedValue(bannedUser as any);

      const result = await controller.banUser('fb_123', { reason: 'Spam' });

      expect(result).toHaveProperty('isBanned', true);
      expect(userService.banUser).toHaveBeenCalledWith('fb_123', 'Spam');
    });
  });

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      jest.spyOn(userService, 'unbanUser').mockResolvedValue(mockUser as any);

      const result = await controller.unbanUser('fb_123');

      expect(result).toHaveProperty('isBanned', false);
      expect(userService.unbanUser).toHaveBeenCalledWith('fb_123');
    });
  });

  describe('suspendUser', () => {
    it('should suspend a user for given days', async () => {
      const suspendedUser = {
        ...mockUser,
        isSuspended: true,
        suspendedUntil: new Date('2026-04-13'),
        toObject: function () {
          return { ...this, _id: { toString: () => 'user_123' } };
        },
      };
      jest.spyOn(userService, 'suspendUser').mockResolvedValue(suspendedUser as any);

      const result = await controller.suspendUser('fb_123', { days: 7, reason: 'Violation' });

      expect(result).toHaveProperty('isSuspended', true);
      expect(userService.suspendUser).toHaveBeenCalledWith('fb_123', 7, 'Violation');
    });
  });

  describe('unsuspendUser', () => {
    it('should unsuspend a user', async () => {
      jest.spyOn(userService, 'unsuspendUser').mockResolvedValue(mockUser as any);

      const result = await controller.unsuspendUser('fb_123');

      expect(result).toHaveProperty('isSuspended', false);
      expect(userService.unsuspendUser).toHaveBeenCalledWith('fb_123');
    });
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      jest.spyOn(eventService, 'getAllEvents').mockResolvedValue([mockEvent] as any);

      const result = await controller.getEvents();

      expect(result).toHaveLength(1);
      expect(eventService.getAllEvents).toHaveBeenCalled();
    });
  });
});

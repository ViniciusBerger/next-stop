import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { FriendsRepository } from '../repository/friends.repository';
import { NotificationService } from '../../notifications/service/notification.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * FriendsService Unit Tests
 *
 * To run: npm test -- friends/service/friends.service.spec.ts
 */
describe('FriendsService - Unit Test', () => {
  let service: FriendsService;
  let repo: FriendsRepository;
  let notificationService: NotificationService;

  const mockRequest = {
    _id: 'req_123',
    requester: 'user_1',
    recipient: 'user_2',
    status: 'pending',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: FriendsRepository,
          useValue: {
            create: jest.fn(),
            getFriends: jest.fn(),
            getRequests: jest.fn(),
            getSuggestions: jest.fn(),
            getOutgoingRequests: jest.fn(),
            findExistingRequest: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            addFriendToUsers: jest.fn(),
            delete: jest.fn(),
            unfriend: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    repo = module.get<FriendsRepository>(FriendsRepository);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFriend', () => {
    it('should create a friend request and send notification', async () => {
      const dto = { requester: 'user_1', recipient: 'user_2' };
      jest.spyOn(repo, 'findExistingRequest').mockResolvedValue(null);
      jest.spyOn(repo, 'create').mockResolvedValue(mockRequest as any);

      const result = await service.addFriend(dto);

      expect(result).toEqual(mockRequest);
      expect(repo.findExistingRequest).toHaveBeenCalledWith('user_1', 'user_2');
      expect(repo.create).toHaveBeenCalledWith({
        requester: 'user_1',
        recipient: 'user_2',
        status: 'pending',
      });
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'user_2',
          sender: 'user_1',
          type: 'friend_request',
          message: 'sent you a friend request',
        }),
      );
    });

    it('should throw ConflictException if request already exists', async () => {
      const dto = { requester: 'user_1', recipient: 'user_2' };
      jest.spyOn(repo, 'findExistingRequest').mockResolvedValue(mockRequest as any);

      await expect(service.addFriend(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('getFriends', () => {
    it('should delegate to repository', async () => {
      const mockUsers = [{ _id: 'user_2', username: 'Jane' }];
      jest.spyOn(repo, 'getFriends').mockResolvedValue(mockUsers as any);

      const result = await service.getFriends('user_1');

      expect(result).toEqual(mockUsers);
      expect(repo.getFriends).toHaveBeenCalledWith('user_1');
    });
  });

  describe('getRequests', () => {
    it('should delegate to repository', async () => {
      jest.spyOn(repo, 'getRequests').mockResolvedValue([mockRequest] as any);

      const result = await service.getRequests('user_2');

      expect(result).toHaveLength(1);
      expect(repo.getRequests).toHaveBeenCalledWith('user_2');
    });
  });

  describe('getSuggestions', () => {
    it('should delegate to repository', async () => {
      const suggestions = [{ _id: 'user_3', username: 'Bob' }];
      jest.spyOn(repo, 'getSuggestions').mockResolvedValue(suggestions as any);

      const result = await service.getSuggestions('user_1');

      expect(result).toEqual(suggestions);
      expect(repo.getSuggestions).toHaveBeenCalledWith('user_1');
    });
  });

  describe('getOutgoingRequests', () => {
    it('should delegate to repository', async () => {
      jest.spyOn(repo, 'getOutgoingRequests').mockResolvedValue([mockRequest] as any);

      const result = await service.getOutgoingRequests('user_1');

      expect(result).toHaveLength(1);
      expect(repo.getOutgoingRequests).toHaveBeenCalledWith('user_1');
    });
  });

  describe('respond', () => {
    it('should accept a request and add friendship', async () => {
      const dto = { requestId: 'req_123', status: 'accepted' };
      const updated = { ...mockRequest, status: 'accepted' };

      jest.spyOn(repo, 'findById').mockResolvedValue(mockRequest as any);
      jest.spyOn(repo, 'updateStatus').mockResolvedValue(updated as any);
      jest.spyOn(repo, 'addFriendToUsers').mockResolvedValue(undefined);

      const result = await service.respond(dto);

      expect(result.status).toBe('accepted');
      expect(repo.addFriendToUsers).toHaveBeenCalledWith('user_1', 'user_2');
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'user_1',
          sender: 'user_2',
          type: 'friend_accepted',
          message: 'accepted your friend request',
        }),
      );
    });

    it('should reject a request without adding friendship', async () => {
      const dto = { requestId: 'req_123', status: 'rejected' };
      const updated = { ...mockRequest, status: 'rejected' };

      jest.spyOn(repo, 'findById').mockResolvedValue(mockRequest as any);
      jest.spyOn(repo, 'updateStatus').mockResolvedValue(updated as any);

      const result = await service.respond(dto);

      expect(result.status).toBe('rejected');
      expect(repo.addFriendToUsers).not.toHaveBeenCalled();
      expect(notificationService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if request not found', async () => {
      const dto = { requestId: 'nonexistent', status: 'accepted' };
      jest.spyOn(repo, 'findById').mockResolvedValue(null);

      await expect(service.respond(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a friendship', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue(mockRequest as any);

      const result = await service.remove('req_123');

      expect(result).toEqual(mockRequest);
      expect(repo.delete).toHaveBeenCalledWith('req_123');
    });
  });

  describe('unfriend', () => {
    it('should unfriend two users', async () => {
      jest.spyOn(repo, 'unfriend').mockResolvedValue({ success: true } as any);

      const result = await service.unfriend('user_1', 'user_2');

      expect(result).toEqual({ success: true });
      expect(repo.unfriend).toHaveBeenCalledWith('user_1', 'user_2');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from '../service/friends.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';

/**
 * FriendsController Unit Tests
 *
 * To run: npm test -- friends/controller/friends.controller.spec.ts
 */
describe('FriendsController - Unit Test', () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockFriend = {
    _id: 'friendship_123',
    requester: 'user_1',
    recipient: 'user_2',
    status: 'pending',
    createdAt: new Date(),
  };

  const mockUser = {
    _id: 'user_2',
    username: 'JaneDoe',
    email: 'jane@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FirebaseAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: FriendsService,
          useValue: {
            addFriend: jest.fn(),
            getFriends: jest.fn(),
            getRequests: jest.fn(),
            getSuggestions: jest.fn(),
            getOutgoingRequests: jest.fn(),
            respond: jest.fn(),
            remove: jest.fn(),
            unfriend: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('addFriend', () => {
    it('should create a friend request', async () => {
      const dto = { requester: 'user_1', recipient: 'user_2' };
      jest.spyOn(service, 'addFriend').mockResolvedValue(mockFriend as any);

      const result = await controller.addFriend(dto as any);

      expect(result).toEqual(mockFriend);
      expect(service.addFriend).toHaveBeenCalledWith(dto);
    });
  });

  describe('getFriends', () => {
    it('should return friends for a user', async () => {
      jest.spyOn(service, 'getFriends').mockResolvedValue([mockUser] as any);

      const result = await controller.getFriends('user_1');

      expect(result).toHaveLength(1);
      expect(service.getFriends).toHaveBeenCalledWith('user_1');
    });

    it('should return empty array when user has no friends', async () => {
      jest.spyOn(service, 'getFriends').mockResolvedValue([]);

      const result = await controller.getFriends('user_lonely');

      expect(result).toEqual([]);
    });
  });

  describe('getRequests', () => {
    it('should return pending requests for a user', async () => {
      const pendingRequest = { ...mockFriend, status: 'pending' };
      jest.spyOn(service, 'getRequests').mockResolvedValue([pendingRequest] as any);

      const result = await controller.getRequests('user_2');

      expect(result).toHaveLength(1);
      expect(service.getRequests).toHaveBeenCalledWith('user_2');
    });
  });

  describe('getSuggestions', () => {
    it('should return friend suggestions', async () => {
      jest.spyOn(service, 'getSuggestions').mockResolvedValue([mockUser] as any);

      const result = await controller.getSuggestions('user_1');

      expect(result).toHaveLength(1);
      expect(service.getSuggestions).toHaveBeenCalledWith('user_1');
    });
  });

  describe('getOutgoingRequests', () => {
    it('should return outgoing pending requests', async () => {
      jest.spyOn(service, 'getOutgoingRequests').mockResolvedValue([mockFriend] as any);

      const result = await controller.getOutgoingRequests('user_1');

      expect(result).toHaveLength(1);
      expect(service.getOutgoingRequests).toHaveBeenCalledWith('user_1');
    });
  });

  describe('respond', () => {
    it('should accept a friend request', async () => {
      const dto = { requestId: 'friendship_123', status: 'accepted' };
      const accepted = { ...mockFriend, status: 'accepted' };
      jest.spyOn(service, 'respond').mockResolvedValue(accepted as any);

      const result = await controller.respond(dto as any);

      expect(result.status).toBe('accepted');
      expect(service.respond).toHaveBeenCalledWith(dto);
    });

    it('should reject a friend request', async () => {
      const dto = { requestId: 'friendship_123', status: 'rejected' };
      const rejected = { ...mockFriend, status: 'rejected' };
      jest.spyOn(service, 'respond').mockResolvedValue(rejected as any);

      const result = await controller.respond(dto as any);

      expect(result.status).toBe('rejected');
      expect(service.respond).toHaveBeenCalledWith(dto);
    });
  });

  describe('unfriend', () => {
    it('should unfriend two users', async () => {
      jest.spyOn(service, 'unfriend').mockResolvedValue({ success: true } as any);

      const result = await controller.unfriend('user_1', 'user_2');

      expect(result).toEqual({ success: true });
      expect(service.unfriend).toHaveBeenCalledWith('user_1', 'user_2');
    });
  });

  describe('remove', () => {
    it('should remove a friendship by id', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockFriend as any);

      const result = await controller.remove('friendship_123');

      expect(result).toEqual(mockFriend);
      expect(service.remove).toHaveBeenCalledWith('friendship_123');
    });
  });
});

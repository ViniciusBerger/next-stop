import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FriendsRepository } from './friends.repository';
import { Friend } from '../schema/friends.schema';
import { User } from '../../user/schemas/user.schema';

/**
 * FriendsRepository Unit Tests
 *
 * To run: npm test -- friends/repository/friends.repository.spec.ts
 */
describe('FriendsRepository - Unit Test', () => {
  let repository: FriendsRepository;
  let friendModel: any;
  let userModel: any;

  const mockFriendship = {
    _id: 'friendship_123',
    requester: 'user_1',
    recipient: 'user_2',
    status: 'pending',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    friendModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsRepository,
        { provide: getModelToken(Friend.name), useValue: friendModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    repository = module.get<FriendsRepository>(FriendsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a friend request', async () => {
      const data = { requester: 'user_1', recipient: 'user_2', status: 'pending' };
      friendModel.create.mockResolvedValue(mockFriendship);

      const result = await repository.create(data);

      expect(result).toEqual(mockFriendship);
      expect(friendModel.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getFriends', () => {
    it('should return accepted friends as user objects', async () => {
      const userId1 = new Types.ObjectId();
      const userId2 = new Types.ObjectId();
      const friendships = [
        { requester: userId1.toString(), recipient: userId2.toString(), status: 'accepted' },
      ];
      const mockUsers = [{ _id: userId2.toString(), username: 'Jane' }];

      friendModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(friendships) });
      userModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUsers) });

      const result = await repository.getFriends(userId1.toString());

      expect(result).toEqual(mockUsers);
      expect(friendModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'accepted' }),
      );
    });
  });

  describe('getRequests', () => {
    it('should return pending requests for a recipient', async () => {
      const requests = [{ ...mockFriendship, requester: { _id: 'user_1', role: 'user' } }];
      friendModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(requests),
        }),
      });

      const result = await repository.getRequests('user_2');

      expect(result).toHaveLength(1);
      expect(friendModel.find).toHaveBeenCalledWith({
        recipient: 'user_2',
        status: 'pending',
      });
    });

    it('should filter out admin requesters', async () => {
      const requests = [
        { ...mockFriendship, requester: { _id: 'admin_1', role: 'admin' } },
        { ...mockFriendship, requester: { _id: 'user_3', role: 'user' } },
      ];
      friendModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(requests),
        }),
      });

      const result = await repository.getRequests('user_2');

      expect(result).toHaveLength(1);
      expect(result[0].requester._id).toBe('user_3');
    });
  });

  describe('getOutgoingRequests', () => {
    it('should return outgoing pending requests', async () => {
      const requests = [{ ...mockFriendship, recipient: { _id: 'user_2', role: 'user' } }];
      friendModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(requests),
        }),
      });

      const result = await repository.getOutgoingRequests('user_1');

      expect(result).toHaveLength(1);
      expect(friendModel.find).toHaveBeenCalledWith({
        requester: 'user_1',
        status: 'pending',
      });
    });
  });

  describe('findExistingRequest', () => {
    it('should find an existing request between two users', async () => {
      friendModel.findOne.mockResolvedValue(mockFriendship);

      const result = await repository.findExistingRequest('user_1', 'user_2');

      expect(result).toEqual(mockFriendship);
      expect(friendModel.findOne).toHaveBeenCalledWith({
        $or: [
          { requester: 'user_1', recipient: 'user_2' },
          { requester: 'user_2', recipient: 'user_1' },
        ],
      });
    });

    it('should return null if no request exists', async () => {
      friendModel.findOne.mockResolvedValue(null);

      const result = await repository.findExistingRequest('user_1', 'user_3');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a request by id', async () => {
      friendModel.findById.mockResolvedValue(mockFriendship);

      const result = await repository.findById('friendship_123');

      expect(result).toEqual(mockFriendship);
    });
  });

  describe('updateStatus', () => {
    it('should update request status', async () => {
      const updated = { ...mockFriendship, status: 'accepted' };
      friendModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await repository.updateStatus('friendship_123', 'accepted');

      expect(result.status).toBe('accepted');
      expect(friendModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'friendship_123',
        expect.objectContaining({ status: 'accepted' }),
        { new: true },
      );
    });
  });

  describe('addFriendToUsers', () => {
    it('should add each user to the other\'s friends array', async () => {
      userModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await repository.addFriendToUsers('user_1', 'user_2');

      expect(userModel.updateOne).toHaveBeenCalledTimes(2);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user_1' },
        { $addToSet: { friends: 'user_2' } },
      );
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user_2' },
        { $addToSet: { friends: 'user_1' } },
      );
    });
  });

  describe('delete', () => {
    it('should delete a friendship by id', async () => {
      friendModel.findByIdAndDelete.mockResolvedValue(mockFriendship);

      const result = await repository.delete('friendship_123');

      expect(result).toEqual(mockFriendship);
      expect(friendModel.findByIdAndDelete).toHaveBeenCalledWith('friendship_123');
    });
  });

  describe('unfriend', () => {
    it('should remove friendship and pull from both users', async () => {
      const friendship = { _id: 'friendship_123', requester: 'user_1', recipient: 'user_2', status: 'accepted' };
      friendModel.findOne.mockResolvedValue(friendship);
      friendModel.findByIdAndDelete.mockResolvedValue(friendship);
      userModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.unfriend('user_1', 'user_2');

      expect(result).toEqual({ success: true });
      expect(friendModel.findByIdAndDelete).toHaveBeenCalledWith('friendship_123');
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user_1' },
        { $pull: { friends: 'user_2' } },
      );
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: 'user_2' },
        { $pull: { friends: 'user_1' } },
      );
    });

    it('should return null if no friendship found', async () => {
      friendModel.findOne.mockResolvedValue(null);

      const result = await repository.unfriend('user_1', 'user_3');

      expect(result).toBeNull();
    });
  });
});

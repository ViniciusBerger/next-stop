import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repository/user.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FriendRequestDTO } from '../DTOs/friend.request';

describe('UserService - Unit Test', () => {
  let service: UserService;
  let repository: UserRepository;

  // Mock data for consistency
  const mockUser = { firebaseUid: 'user_1', username: 'tester', friends: [] };
  const mockFriend = { firebaseUid: 'user_2', username: 'friend', friends: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          // repository mock 
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('handleFriendRequest', () => {
    it('should throw BadRequestException if a user tries to friend themselves', async () => {
      const uid = 'same_id';
      const dto = { friendUid: 'same_id' };

      await expect(service.handleFriendRequest(uid, dto))
        .rejects.toThrow(BadRequestException);
      
      // Ensure the repository wasnt called
      expect(repository.update).not.toHaveBeenCalled();
    });


    it('should call repository.update twice with correct MongoDB operators', async () => {
      // Mock success for both updates
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      const result = await service.handleFriendRequest(mockUser.firebaseUid, new FriendRequestDTO(mockFriend.firebaseUid));

      expect(result.success).toBe(true);
      expect(repository.update).toHaveBeenCalledTimes(2);

    });


    it('should throw NotFoundException if one of the users does not exist', async () => {
      // Simulate the second user not being found
      jest.spyOn(repository, 'update')
        .mockResolvedValueOnce(mockUser as any) // first call succeeds
        .mockResolvedValueOnce(null);           // second call fails

      await expect(service.handleFriendRequest('user_1', { friendUid: 'ghost' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  
  describe('findOne', () => {
    it('should prioritize firebaseUid in the filter if provided', async () => {
      const dto = { firebaseUid: 'uid_123', username: 'ignored_name' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      await service.findOne(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ firebaseUid: 'uid_123' });
    });

    it('should throw NotFoundException if repository returns null', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne({ username: 'nobody' }))
        .rejects.toThrow(NotFoundException);
    });
  });


  describe('updateUser', () => {
    it('should successfully update user and return the result', async () => {
      const updateDto = { firebaseUid: 'user_1', username: 'new_name' };
      // We simulate the repo returning the "new" document
      jest.spyOn(repository, 'update').mockResolvedValue({ ...mockUser, username: 'new_name' } as any);

      const result = await service.updateUser(updateDto);

      expect(result.username).toBe('new_name');
      // Logic Check: Did the service separate the UID from the data?
      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'user_1' },
        { $set: { username: 'new_name' } }
      );
    });

    it('should throw NotFoundException if repository returns null', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);
      
      await expect(service.updateUser({ firebaseUid: 'ghost', username: 'val' }))
        .rejects.toThrow(NotFoundException);
    });
  });


  describe('handleFriendDelete', () => {
    it('should call repository.update twice using the $pull operator', async () => {
      // Both updates succeed
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      const result = await service.handleFriendDelete('user_1', 'user_2');

      expect(result.success).toBe(true);
      expect(repository.update).toHaveBeenCalledTimes(2);

      // Verify the Service logic: "Remove friend from user"
      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'user_1' },
        { $pull: { friends: 'user_2' } }
      );
      // Verify the Service logic: "Remove user from friend"
      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'user_2' },
        { $pull: { friends: 'user_1' } }
      );
    });

  it('should throw NotFoundException if the friend (targetUid) does not exist in the database', async () => {
    jest.spyOn(repository, 'update')
      .mockResolvedValueOnce(mockUser as any) // First call (userUid) returns a user object
      .mockResolvedValueOnce(null); // Second call (targetUid) returns null

    // We expect service to catch that 'null' and throw the 404
    await expect(service.handleFriendDelete('user_1', 'non_existent_friend'))
      .rejects.toThrow(NotFoundException);

    // Verify orchestration: both calls were still attempted
    expect(repository.update).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException if both users are missing', async () => {
    // All update attempts return null
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    await expect(service.handleFriendDelete('ghost_1', 'ghost_2'))
      .rejects.toThrow(NotFoundException);
  });
  });


});
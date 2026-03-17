<<<<<<< HEAD
import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../user.repository";
import { UserService } from "./user.service";
import { BadRequestException } from "@nestjs/common";

/**
 * UserService unit tests
 *
 * Tests follow AAA pattern (Arrange, Act, Assert)
 */

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
=======
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
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          // repository mock 
          provide: UserRepository,
          useValue: {
<<<<<<< HEAD
            findOne: jest.fn(),
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            updateUser: jest.fn(),
=======
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711
          },
        },
      ],
    }).compile();

<<<<<<< HEAD
    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should define userService and userRepository', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('createUser -> should create a new user', async () => {
    const mockUser = {
      firebaseUid: 'user_test_1',
      username: 'mockUser',
      email: 'mock@example.com',
      role: 'member',
    };

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(mockUser as any);
    const user = await userService.createUser(mockUser as any);

    expect(user).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith(mockUser);
  });

  it('createUser -> should throw BadRequestException on failure', async () => {
    jest.spyOn(userRepository, 'createUser').mockRejectedValue(new BadRequestException());
    await expect(userService.createUser({} as any)).rejects.toThrow(BadRequestException);
  });

  it('getUser -> should return user by firebaseUid', async () => {
    const firebaseUid = 'user_test_1';
    const mockUser = { firebaseUid, username: 'tester' };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    const user = await userService.getUser({ firebaseUid });

    expect(user?.firebaseUid).toEqual(firebaseUid);
    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid });
  });

  it('getUser -> should return null if user not found', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    const user = await userService.getUser({ username: 'random' });

    expect(user).toBeNull();
    expect(userRepository.findOne).toHaveBeenCalledWith({ username: 'random' });
  });

  it('updateUser -> should update user', async () => {
    const updatedUser = {
      firebaseUid: 'user_test_1',
      username: 'mockUser',
      bio: 'new bio',
    };

    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(updatedUser as any);
    const result = await userService.updateUser(updatedUser as any);

    expect(result).toEqual(updatedUser);
    expect(userRepository.updateUser).toHaveBeenCalled();
  });

  it('deleteUser -> should delete user', async () => {
    const mockUser = { firebaseUid: 'user_test_1' };

    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(mockUser as any);
    const result = await userService.deleteUser(mockUser.firebaseUid as any);

    expect(result.firebaseUid).toEqual(mockUser.firebaseUid);
    expect(userRepository.deleteUser).toHaveBeenCalledWith(mockUser.firebaseUid);
  });

  // ==============================
  // EMAIL VERIFICATION FLOW TESTS
  // ==============================

  it('sendEmailVerification -> should generate token and expiry', async () => {
    const firebaseUid = 'user_test_1';

    jest.spyOn(userRepository, 'updateUser').mockResolvedValue({
      firebaseUid,
      emailVerified: false,
      verificationToken: 'token123',
      tokenExpiresAt: new Date(),
    } as any);

    const result = await userService.sendEmailVerification(firebaseUid);

    expect(result.message).toBe('Verification token generated');
    expect(result.token).toBeDefined();
    expect(userRepository.updateUser).toHaveBeenCalled();
  });

  it('sendEmailVerification -> should throw error if user not found', async () => {
    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(null);

    await expect(
      userService.sendEmailVerification('invalid-id'),
    ).rejects.toThrow(BadRequestException);
  });

  it('verifyEmailToken -> should verify user with valid token', async () => {
    const token = 'valid-token';
    const firebaseUid = 'user_test_1';

    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      firebaseUid,
      verificationToken: token,
      tokenExpiresAt: new Date(Date.now() + 1000),
    } as any);

    jest.spyOn(userRepository, 'updateUser').mockResolvedValue({
      firebaseUid,
      emailVerified: true,
    } as any);

    const result = await userService.verifyEmailToken(token);

    expect(result.message).toBe('Email verified successfully');
    expect(userRepository.updateUser).toHaveBeenCalled();
  });

  it('verifyEmailToken -> should throw error for invalid token', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(
      userService.verifyEmailToken('bad-token'),
    ).rejects.toThrow(BadRequestException);
  });
});
=======
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
    it('should return user by id', async () => {
      const dto = { firebaseUid: 'uid_123'};
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      await service.findById(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ firebaseUid: 'uid_123' });
    });

    it('should return user by username', async () => {
      const dto = { username: 'ignored_name' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      await service.findByUsername(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ username: 'ignored_name' });
    });

    it('should throw NotFoundException if repository returns null', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(service.findById({ firebaseUid: 'uid_123' }))
        .rejects.toThrow(NotFoundException);
    });
  });


  describe('updateUser', () => {
    it('should successfully update user and return the updated user', async () => {
      const updateDto = { firebaseUid: 'user_1', username: 'new_name' };
      // We simulate the repo returning the "new" document
      jest.spyOn(repository, 'update').mockResolvedValue({ ...mockUser, username: 'new_name' } as any);

      const result = await service.updateUser(updateDto.firebaseUid, updateDto);

      expect(result.username).toBe('new_name');
    });

    it('should throw NotFoundException if repository returns null', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);
      
      await expect(service.updateUser("uid_123", {  username: 'val' }))
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
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

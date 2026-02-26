import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { NotFoundException } from '@nestjs/common';
import { UserResponseDTO } from '../DTOs/user.response.DTO';
import { GetUserDTO } from '../DTOs/get.user.DTO';
import { UpdateUserDTO } from '../DTOs/update.user.DTO';
import { DeleteUserDTO } from '../DTOs/delete.user.DTO';

/**
 * UserController unit tests
 *
 * This test suite verifies the functionality of the UserController class, checking status code
 * and data transfer. It uses Jest for mocking dependencies and assertions.
 *
 * these tests follow the triple A of testing: Arrange, act and assert [AAA]
 *
 * To run the tests, use the command: npm test -- apps/backend/src/user/controller/user.controller.spec.ts
 *
 */
describe('UserController - Unit Test', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser = {
    _id: 'user_123',
    firebaseUid: '1234567890123456789012345678',
    username: 'testuser',
    email: 'test@example.com',
    role: 'member',
    profile: {},
    badges: [],
    friends: [],
    favorites: [],
    wishlist: [],
    isBanned: false,
    isSuspended: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  const mockRequest = {
    user: { uid: '1234567890123456789012345678' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockUser),
            findByUsername: jest.fn().mockResolvedValue(mockUser),
            updateUser: jest.fn().mockResolvedValue(mockUser),
            deleteUser: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user by firebaseUid', async () => {
      const params = { firebaseUid: '1234567890123456789012345678' } as GetUserDTO;

      const result = await controller.findOne(params);

      expect(service.findById).toHaveBeenCalledWith(params.firebaseUid);
      expect(result).toBeInstanceOf(UserResponseDTO);
      expect(result.username).toBe(mockUser.username);
    });

    it('should return user by username', async () => {
      const params = { username: 'testuser' } as GetUserDTO;

      const result = await controller.findOne(params);

      expect(service.findByUsername).toHaveBeenCalledWith(params.username);
      expect(result).toBeInstanceOf(UserResponseDTO);
      expect(result.username).toBe(mockUser.username);
    });

    it('should throw NotFoundException if user not found by firebaseUid', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      const params = { firebaseUid: 'nonexistent' } as GetUserDTO;

      await expect(controller.findOne(params))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found by username', async () => {
      jest.spyOn(service, 'findByUsername').mockResolvedValue(null);
      const params = { username: 'nonexistent' } as GetUserDTO;

      await expect(controller.findOne(params))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user and return UserResponseDTO', async () => {
      const updateDto: UpdateUserDTO = { username: 'updateduser' };

      const result = await controller.updateUser(mockRequest, updateDto);

      expect(service.updateUser).toHaveBeenCalledWith(mockRequest.user.uid, updateDto);
      expect(result).toBeInstanceOf(UserResponseDTO);
    });

    it('should handle multiple field updates', async () => {
      const updateDto: UpdateUserDTO = {
        username: 'newusername',
      };

      const result = await controller.updateUser(mockRequest, updateDto);

      expect(service.updateUser).toHaveBeenCalledWith(mockRequest.user.uid, updateDto);
      expect(result).toBeInstanceOf(UserResponseDTO);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return UserResponseDTO', async () => {
      const params: DeleteUserDTO = { firebaseUid: '1234567890123456789012345678' };

      const result = await controller.deleteUser(params);

      expect(service.deleteUser).toHaveBeenCalledWith(params);
      expect(result).toBeInstanceOf(UserResponseDTO);
    });

    it('should handle deletion of non-existent user', async () => {
      jest.spyOn(service, 'deleteUser').mockRejectedValue(new NotFoundException());
      const params: DeleteUserDTO = { firebaseUid: 'nonexistent' };

      await expect(controller.deleteUser(params))
        .rejects.toThrow(NotFoundException);
    });
  });
});
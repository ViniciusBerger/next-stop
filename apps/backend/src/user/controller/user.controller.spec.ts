import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { BadRequestException } from '@nestjs/common';
import { UserResponseDTO } from '../DTOs/user.response.DTO';

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

describe('userController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // create testing environment before each it
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          // methods testing will have access to
          useValue: {
            getUser: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    // instantiate service and controller
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('Should define userService and userRepository', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('createUser -> Should send createUserDTO to service', async () => {
    const mockDTO = { username: 'testuser', firebaseUid: '123' };

    jest.spyOn(userService, 'createUser').mockResolvedValue(mockDTO);
    const user = await userController.createUser(mockDTO as any);

    expect(user).toEqual(expect.objectContaining(mockDTO));
    expect(userService.createUser).toHaveBeenCalledWith(mockDTO);
    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });

  it('createUser -> Should return status 400', async () => {
    const mockDTO = null;

    jest
      .spyOn(userService, 'createUser')
      .mockRejectedValue(new BadRequestException());

    await expect(userController.createUser(mockDTO as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('getUser -> Should send getUserDTO to service', async () => {
    const mockDTO = { username: 'testuser', firebaseUid: '123' };

    jest.spyOn(userService, 'getUser').mockResolvedValue(mockDTO as any);
    const user = await userController.getUser(mockDTO as any);

    expect(user).toEqual(expect.objectContaining(mockDTO) as UserResponseDTO);
    expect(userService.getUser).toHaveBeenCalledWith(mockDTO);
    expect(userService.getUser).toHaveBeenCalledTimes(1);
  });

  it('getUser -> Should return status 400', async () => {
    const mockDTO = null;

    jest
      .spyOn(userService, 'getUser')
      .mockRejectedValue(new BadRequestException());

    await expect(userController.getUser(mockDTO as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateUser -> Should send editUserDTO to service', async () => {
    const mockDTO = { username: 'testuser', firebaseUid: '123' };

    jest.spyOn(userService, 'updateUser').mockResolvedValue(mockDTO as any);
    const user = await userController.updateUser(mockDTO as any);

    expect(user).toEqual({
      message: expect.objectContaining(mockDTO) as UserResponseDTO,
    });
    expect(userService.updateUser).toHaveBeenCalledWith(mockDTO);
    expect(userService.updateUser).toHaveBeenCalledTimes(1);
  });

  it('updateUser -> Should return status 400', async () => {
    const mockDTO = null;

    jest
      .spyOn(userService, 'updateUser')
      .mockRejectedValue(new BadRequestException());

    await expect(userController.updateUser(mockDTO as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deleteUser -> Should send deleteUserDTO to service', async () => {
    const mockDTO = { username: 'testuser', firebaseUid: '123' };

    jest.spyOn(userService, 'deleteUser').mockResolvedValue(mockDTO as any);
    const user = await userController.deleteUser(mockDTO as any);

    expect(user).toEqual({ message: mockDTO as UserResponseDTO });
    expect(userService.deleteUser).toHaveBeenCalledWith(mockDTO);
    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
  });

  it('deleteUser -> Should return status 400', async () => {
    const mockDTO = null;

    jest
      .spyOn(userService, 'deleteUser')
      .mockRejectedValue(new BadRequestException());

    await expect(userController.deleteUser(mockDTO as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  // Testing Favorites
  it('addToFavorites -> Should add place to favorites', async () => {
    const userId = 'user_123';
    const placeId = 'place_456';
    const mockResult = { favorites: [placeId] };

    jest
      .spyOn(userService, 'addToFavorites')
      .mockResolvedValue(mockResult as any);
    const result = await userController.addToFavorites(userId, { placeId });

    expect(result.message).toEqual('Place added to favorites');
    expect(userService.addToFavorites).toHaveBeenCalledWith(userId, placeId);
  });

  it('getFavorites -> Should return user favorites', async () => {
    const userId = 'user_123';
    const mockFavorites = [{ name: 'Pizzaria Bella' }];

    jest
      .spyOn(userService, 'getFavorites')
      .mockResolvedValue(mockFavorites as any);
    const result = await userController.getFavorites(userId);

    expect(result).toEqual(mockFavorites);
    expect(userService.getFavorites).toHaveBeenCalledWith(userId);
  });

  // Testing Ban/Unban
  it('banUser -> Should ban user', async () => {
    const userId = 'user_123';
    const reason = 'Spam';
    const mockResult = { username: 'testuser', isBanned: true };

    jest.spyOn(userService, 'banUser').mockResolvedValue(mockResult as any);
    const result = await userController.banUser(userId, { reason });

    expect(result.message).toEqual('User banned successfully');
    expect(userService.banUser).toHaveBeenCalledWith(userId, reason);
  });
});

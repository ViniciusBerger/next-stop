import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserResponseDTO } from '../DTOs/user.response.DTO';

/**
 * UserController unit tests
 *
 * This test suite verifies the functionality of the UserController class,
 * checking status code behavior and data mapping into DTO responses.
 *
 * Tests follow the Arrange-Act-Assert [AAA] pattern.
 *
 * To run the tests:
 *   npm test -- apps/backend/src/user/controller/user.controller.spec.ts
 */

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  // Shared mock for service methods used by the controller
  const mockUserService = {
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),

    addToFavorites: jest.fn(),
    getFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),

    addToWishlist: jest.fn(),
    getWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),

    banUser: jest.fn(),
    unbanUser: jest.fn(),
    suspendUser: jest.fn(),
    unsuspendUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should define controller and service', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  // ---------- CREATE ----------
  it('createUser -> should forward DTO to service and return UserResponseDTO', async () => {
    const createDTO = { username: 'testuser', firebaseUid: 'uid_123', email: 'u@test.com' };
    // Service returns a full user doc shape; controller maps it to DTO
    const mockUserDoc = {
      ...createDTO,
      role: 'member',
      profile: {},
      bio: '',
      profilePicture: '',
      badges: [],
      friends: [],
      isBanned: false,
      isSuspended: false,
      favorites: [],
      wishlist: [],
    };

    jest.spyOn(userService, 'createUser').mockResolvedValue(mockUserDoc as any);

    const result = await userController.createUser(createDTO as any);

    expect(result).toBeInstanceOf(UserResponseDTO);
    expect((result as any).username).toBe(createDTO.username);
    expect(userService.createUser).toHaveBeenCalledWith(createDTO);
    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });

  it('createUser -> should throw BadRequestException', async () => {
    jest.spyOn(userService, 'createUser').mockRejectedValue(new BadRequestException());

    await expect(userController.createUser(null as any)).rejects.toThrow(BadRequestException);
  });

  // ---------- GET ----------
  it('getUser -> should map query to service and return UserResponseDTO', async () => {
    const query = { firebaseUid: 'uid_123' };
    const mockUserDoc = { firebaseUid: 'uid_123', username: 'tester', email: 't@test.com' };

    jest.spyOn(userService, 'getUser').mockResolvedValue(mockUserDoc as any);

    const result = await userController.getUser(query as any);

    expect(result).toBeInstanceOf(UserResponseDTO);
    expect((result as any).username).toBe('tester');
    expect(userService.getUser).toHaveBeenCalledWith(query);
    expect(userService.getUser).toHaveBeenCalledTimes(1);
  });

  it('getUser -> should throw NotFoundException when user is null', async () => {
    jest.spyOn(userService, 'getUser').mockResolvedValue(null as any);

    await expect(userController.getUser({ firebaseUid: 'nope' } as any)).rejects.toThrow(NotFoundException);
  });

  // ---------- UPDATE ----------
  it('updateUser -> should forward param + body and return UserResponseDTO', async () => {
    const firebaseUid = 'uid_123';
    const editBody = { username: 'newname', bio: 'about me' };
    const mockUpdated = {
      firebaseUid,
      username: 'newname',
      email: 't@test.com',
      bio: 'about me',
    };

    jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUpdated as any);

    // NOTE: The controller signature is (firebaseUid: string, dto: EditUserDTO)
    const result = await userController.updateUser(firebaseUid, editBody as any);

    expect(result).toBeInstanceOf(UserResponseDTO);
    expect((result as any).username).toBe('newname');
    expect(userService.updateUser).toHaveBeenCalledWith({ ...editBody, firebaseUid });
    expect(userService.updateUser).toHaveBeenCalledTimes(1);
  });

  it('updateUser -> should throw BadRequestException from service', async () => {
    const firebaseUid = 'uid_123';
    const editBody = { username: 'x' };

    jest.spyOn(userService, 'updateUser').mockRejectedValue(new BadRequestException());

    await expect(userController.updateUser(firebaseUid, editBody as any)).rejects.toThrow(BadRequestException);
  });

  // ---------- DELETE ----------
  it('deleteUser -> should forward UID param to service and return UserResponseDTO', async () => {
    const firebaseUid = 'uid_123';
    const mockDeleted = { firebaseUid, username: 'tester', email: 't@test.com' };

    jest.spyOn(userService, 'deleteUser').mockResolvedValue(mockDeleted as any);

    const result = await userController.deleteUser(firebaseUid);

    expect(result).toBeInstanceOf(UserResponseDTO);
    expect((result as any).username).toBe('tester');
    expect(userService.deleteUser).toHaveBeenCalledWith(firebaseUid);
    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
  });

  it('deleteUser -> should throw NotFoundException when user is null', async () => {
    jest.spyOn(userService, 'deleteUser').mockResolvedValue(null as any);

    await expect(userController.deleteUser('uid_404')).rejects.toThrow(NotFoundException);
  });

  // ---------- FAVORITES ----------
  it('addToFavorites -> should add place to favorites', async () => {
    const firebaseUid = 'uid_123';
    const placeId = '507f1f77bcf86cd799439011';
    const mockUser = { favorites: [placeId] };

    jest.spyOn(userService, 'addToFavorites').mockResolvedValue(mockUser as any);

    const result = await userController.addToFavorites(firebaseUid, { placeId });

    expect(result.message).toEqual('Place added to favorites');
    expect(result.favorites).toContain(placeId);
    expect(userService.addToFavorites).toHaveBeenCalledWith(firebaseUid, placeId);
  });

  it('getFavorites -> should return user favorites', async () => {
    const firebaseUid = 'uid_123';
    const mockFavorites = [{ name: 'Pizzaria Bella' }];

    jest.spyOn(userService, 'getFavorites').mockResolvedValue(mockFavorites as any);

    const result = await userController.getFavorites(firebaseUid);

    expect(result).toEqual(mockFavorites);
    expect(userService.getFavorites).toHaveBeenCalledWith(firebaseUid);
  });

  it('removeFromFavorites -> should remove place from favorites', async () => {
    const firebaseUid = 'uid_123';
    const placeId = '507f1f77bcf86cd799439011';
    const mockUser = { favorites: [] };

    jest.spyOn(userService, 'removeFromFavorites').mockResolvedValue(mockUser as any);

    const result = await userController.removeFromFavorites(firebaseUid, placeId);

    expect(result.message).toEqual('Place removed from favorites');
    expect(result.favorites).toEqual([]);
    expect(userService.removeFromFavorites).toHaveBeenCalledWith(firebaseUid, placeId);
  });

  // ---------- WISHLIST ----------
  it('addToWishlist -> should add place to wishlist', async () => {
    const firebaseUid = 'uid_123';
    const placeId = '507f1f77bcf86cd799439013';
    const mockUser = { wishlist: [placeId] };

    jest.spyOn(userService, 'addToWishlist').mockResolvedValue(mockUser as any);

    const result = await userController.addToWishlist(firebaseUid, { placeId });

    expect(result.message).toEqual('Place added to wishlist');
    expect(result.wishlist).toContain(placeId);
    expect(userService.addToWishlist).toHaveBeenCalledWith(firebaseUid, placeId);
  });

  it('getWishlist -> should return user wishlist', async () => {
    const firebaseUid = 'uid_123';
    const mockWishlist = [{ name: 'Place 1' }, { name: 'Place 2' }];

    jest.spyOn(userService, 'getWishlist').mockResolvedValue(mockWishlist as any);

    const result = await userController.getWishlist(firebaseUid);

    expect(result).toEqual(mockWishlist);
    expect(userService.getWishlist).toHaveBeenCalledWith(firebaseUid);
  });

  it('removeFromWishlist -> should remove place from wishlist', async () => {
    const firebaseUid = 'uid_123';
    const placeId = '507f1f77bcf86cd799439013';
    const mockUser = { wishlist: [] };

    jest.spyOn(userService, 'removeFromWishlist').mockResolvedValue(mockUser as any);

    const result = await userController.removeFromWishlist(firebaseUid, placeId);

    expect(result.message).toEqual('Place removed from wishlist');
    expect(result.wishlist).toEqual([]);
    expect(userService.removeFromWishlist).toHaveBeenCalledWith(firebaseUid, placeId);
  });

  // ---------- ADMIN ----------
  it('banUser -> should ban user', async () => {
    const firebaseUid = 'uid_123';
    const reason = 'Spam';
    const mockUser = { username: 'tester', isBanned: true, bannedAt: new Date(), banReason: reason };

    jest.spyOn(userService, 'banUser').mockResolvedValue(mockUser as any);

    const result = await userController.banUser(firebaseUid, { reason });

    expect(result.message).toEqual('User banned successfully');
    expect(result.user.username).toEqual('tester');
    expect(result.user.isBanned).toBe(true);
    expect(userService.banUser).toHaveBeenCalledWith(firebaseUid, reason);
  });

  it('unbanUser -> should unban user', async () => {
    const firebaseUid = 'uid_123';
    const mockUser = { username: 'tester', isBanned: false };

    jest.spyOn(userService, 'unbanUser').mockResolvedValue(mockUser as any);

    const result = await userController.unbanUser(firebaseUid);

    expect(result.message).toEqual('User unbanned successfully');
    expect(result.user.isBanned).toBe(false);
    expect(userService.unbanUser).toHaveBeenCalledWith(firebaseUid);
  });

  it('suspendUser -> should suspend user until date', async () => {
    const firebaseUid = 'uid_123';
    const suspendedUntil = new Date('2026-12-31');
    const reason = 'Violation';
    const mockUser = { username: 'tester', isSuspended: true, suspendedUntil, suspensionReason: reason };

    jest.spyOn(userService, 'suspendUser').mockResolvedValue(mockUser as any);

    const result = await userController.suspendUser(firebaseUid, {
      suspendedUntil: suspendedUntil.toISOString(),
      reason,
    });

    expect(result.message).toEqual('User suspended successfully');
    expect(result.user.isSuspended).toBe(true);
    expect(result.user.suspendedUntil).toEqual(suspendedUntil);
    expect(userService.suspendUser).toHaveBeenCalledWith(firebaseUid, suspendedUntil, reason);
  });

  it('unsuspendUser -> should unsuspend user', async () => {
    const firebaseUid = 'uid_123';
    const mockUser = { username: 'tester', isSuspended: false };

    jest.spyOn(userService, 'unsuspendUser').mockResolvedValue(mockUser as any);

    const result = await userController.unsuspendUser(firebaseUid);

    expect(result.message).toEqual('User unsuspended successfully');
    expect(result.user.isSuspended).toBe(false);
    expect(userService.unsuspendUser).toHaveBeenCalledWith(firebaseUid);
  });
});
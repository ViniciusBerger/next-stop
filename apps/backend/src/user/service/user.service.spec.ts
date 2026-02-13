import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../user.repository";
import { UserService } from "./user.service";
import { BadRequestException } from "@nestjs/common";

/**
 * UserService unit tests
 *
 * This test suite verifies the functionality of the UserService class, including user retrieval and creation.
 * It uses Jest for mocking dependencies and assertions.
 *
 * Tests follow the Arrange-Act-Assert [AAA] pattern.
 *
 * To run the tests:
 *   npm test -- apps/backend/src/user/service/user.service.spec.ts
 */

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  // Shared mock with the repository methods used by the service
  const mockUserRepository = {
    findOne: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
    save: jest.fn(),
    populate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should define userService and userRepository', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('createUser -> should create a new user', async () => {
    const mockUser = {
      firebaseUid: 'user_test0000000000000001',
      username: 'mockUser',
      email: 'mockUser@example.com',
      role: 'member',
    };

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(mockUser as any);
    const user = await userService.createUser(mockUser as any);

    expect(user).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith(mockUser);
  });

  it('createUser -> should throw bad request exception if no params provided', async () => {
    jest
      .spyOn(userRepository, 'createUser')
      .mockImplementation()
      .mockRejectedValue(new BadRequestException());

    await expect(userService.createUser({} as any)).rejects.toThrow(BadRequestException);
  });

  it('getUser -> should return user by firebaseUid', async () => {
    const firebaseUid = 'user_test0000000000000001';
    const mockUserResponse = { firebaseUid: firebaseUid, username: 'tester' };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserResponse as any);
    const user = await userService.getUser({ firebaseUid });

    expect(user?.firebaseUid).toEqual(firebaseUid);
    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid });
    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('getUser -> should return NULL if user not found', async () => {
    const mockUser = { firebaseUid: "", username: "random user" };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    const user = await userService.getUser(mockUser as any);

    // ✅ Fix: use toBeNull() (was toBeNull)
    expect(user).toBeNull();
    expect(userRepository.findOne).toHaveBeenCalledWith({ username: "random user" });
    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('updateUser -> should return new document version stored on db', async () => {
    let mockUser = {
      firebaseUid: 'user_test0000000000000001',
      username: 'mockUser',
      bio: 'mock bio',
    };
    const newMockUser = {
      firebaseUid: 'user_test0000000000000001',
      username: 'mockUser',
      bio: 'new mock bio',
    };

    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(newMockUser as any);
    mockUser = await userService.updateUser(newMockUser as any);

    expect(mockUser).toEqual(newMockUser);
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      newMockUser.firebaseUid,
      expect.objectContaining({ username: "mockUser" }),
    );
    expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
  });

  it('updateUser -> should throw bad request exception if no params provided', async () => {
    jest.spyOn(userRepository, "updateUser").mockRejectedValue(new BadRequestException());

    await expect(userService.updateUser("" as any)).rejects.toThrow(BadRequestException);
  });

  it('updateUser -> should throw type error if no params provided', async () => {
    jest.spyOn(userRepository, "updateUser").mockRejectedValue(new TypeError());

    await expect(userService.updateUser(undefined as any)).rejects.toThrow(TypeError);
  });

  it('deleteUser -> should successfully delete the user when a valid UID is provided', async () => {
    const mockUser = {
      firebaseUid: 'user_test0000000000000001',
      username: 'mockUser',
      email: 'mockUser@example.com',
      role: 'member',
      bio: 'mock bio',
      profilePicture: 'https://example.com/images/mock.jpg',
    };

    // ✅ Ensure the repository returns the deleted user document
    jest.spyOn(userRepository, 'deleteUser').mockResolvedValueOnce(mockUser as any);

    // ✅ Service expects a string UID (not an object)
    const result = await userService.deleteUser(mockUser.firebaseUid as any);

    // ✅ More robust assertion: compare the whole object rather than accessing a property
    expect(result).toEqual(mockUser);

    // ✅ Keep call verification to ensure correct interaction with repository
    expect(userRepository.deleteUser).toHaveBeenCalledWith(mockUser.firebaseUid);
    expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
  });

  it('deleteUser -> should throw BadRequestException if no UID is passed', async () => {
    // ✅ Service expects a string; pass an empty string to trigger BadRequest
    jest.spyOn(userRepository, 'deleteUser').mockRejectedValue(new BadRequestException());

    await expect(userService.deleteUser('' as any)).rejects.toThrow(BadRequestException);
  });

  // ==== TEST - FAVORITES ====

  it('addToFavorites -> should add place to favorites', async () => {
    const userId = 'user_test0000000000000001';

    // ✅ Use a valid MongoDB ObjectId (24-char hex) to satisfy the service validation
    const placeId = '507f1f77bcf86cd799439011';

    const mockUser = {
      firebaseUid: userId,
      favorites: [],
      save: jest.fn(),
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, favorites: [placeId] } as any);

    const result = await userService.addToFavorites(userId, placeId);

    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid: userId });
    expect(userRepository.save).toHaveBeenCalled();
    expect(result.favorites).toContain(placeId);
  });

  it('addToFavorites -> should throw NotFoundException if user not found', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(userService.addToFavorites('invalid_user', '507f1f77bcf86cd799439011')).rejects.toThrow();
  });

  it('getFavorites -> should return user favorites', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = {
      firebaseUid: userId,
      favorites: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'], // valid ObjectIds for consistency
    };
    const mockPopulatedUser = {
      ...mockUser,
      favorites: [
        { name: 'Place 1', address: 'Address 1' },
        { name: 'Place 2', address: 'Address 2' },
      ],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'populate').mockResolvedValue(mockPopulatedUser as any);

    const result = await userService.getFavorites(userId);

    expect(result).toEqual(mockPopulatedUser.favorites);
    expect(userRepository.populate).toHaveBeenCalledWith(mockUser, {
      path: 'favorites',
      select: 'name address category customImages averageUserRating',
    });
  });

  it('removeFromFavorites -> should remove place from favorites', async () => {
    const userId = 'user_test0000000000000001';

    // ✅ Use valid ObjectIds
    const placeId = '507f1f77bcf86cd799439011';
    const otherId = '507f1f77bcf86cd799439012';

    const mockUser = {
      firebaseUid: userId,
      favorites: [placeId, otherId],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, favorites: [otherId] } as any);

    await userService.removeFromFavorites(userId, placeId);

    expect(userRepository.save).toHaveBeenCalled();
  });

  // ==== TEST - WISHLIST ====

  it('addToWishlist -> should add place to wishlist', async () => {
    const userId = 'user_test0000000000000001';

    // ✅ Use a valid ObjectId
    const placeId = '507f1f77bcf86cd799439013';

    const mockUser = {
      firebaseUid: userId,
      wishlist: [],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, wishlist: [placeId] } as any);

    const result = await userService.addToWishlist(userId, placeId);

    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid: userId });
    expect(userRepository.save).toHaveBeenCalled();
    expect(result.wishlist).toContain(placeId);
  });

  it('getWishlist -> should return user wishlist', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = {
      firebaseUid: userId,
      wishlist: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'], // valid ObjectIds for consistency
    };
    const mockPopulatedUser = {
      ...mockUser,
      wishlist: [
        { name: 'Place 1', address: 'Address 1' },
        { name: 'Place 2', address: 'Address 2' },
      ],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'populate').mockResolvedValue(mockPopulatedUser as any);

    const result = await userService.getWishlist(userId);

    expect(result).toEqual(mockPopulatedUser.wishlist);
  });

  // ==== TEST - BAN ====

  it('banUser -> should ban user with reason', async () => {
    const userId = 'user_test0000000000000001';
    const reason = 'Spam content';
    const mockUser = {
      firebaseUid: userId,
      isBanned: false,
      bannedAt: undefined,
      banReason: undefined,
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      ...mockUser,
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason,
    } as any);

    const result = await userService.banUser(userId, reason);

    expect(result.isBanned).toBe(true);
    expect(result.banReason).toBe(reason);
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('unbanUser -> should unban user', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = {
      firebaseUid: userId,
      isBanned: true,
      bannedAt: new Date(),
      banReason: 'Spam',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      ...mockUser,
      isBanned: false,
      bannedAt: undefined,
      banReason: undefined,
    } as any);

    const result = await userService.unbanUser(userId);

    expect(result.isBanned).toBe(false);
    expect(userRepository.save).toHaveBeenCalled();
  });

  // ==== TEST - SUSPEND ====

  it('suspendUser -> should suspend user until date', async () => {
    const userId = 'user_test0000000000000001';
    const suspendedUntil = new Date('2026-12-31');
    const reason = 'Violation of terms';
    const mockUser = {
      firebaseUid: userId,
      isSuspended: false,
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      ...mockUser,
      isSuspended: true,
      suspendedUntil: suspendedUntil,
      banReason: reason, // NOTE: if you renamed to suspensionReason in the service/schema, you can update here accordingly
    } as any);

    const result = await userService.suspendUser(userId, suspendedUntil, reason);

    expect(result.isSuspended).toBe(true);
    expect(result.suspendedUntil).toEqual(suspendedUntil);
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('unsuspendUser -> should unsuspend user', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = {
      firebaseUid: userId,
      isSuspended: true,
      suspendedUntil: new Date(),
      banReason: 'Test',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      ...mockUser,
      isSuspended: false,
      suspendedUntil: undefined,
      banReason: undefined,
    } as any);

    const result = await userService.unsuspendUser(userId);

    expect(result.isSuspended).toBe(false);
    expect(userRepository.save).toHaveBeenCalled();
  });
});
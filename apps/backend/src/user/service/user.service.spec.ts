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
 * these tests follow the triple A of testing: Arrange, act and assert [AAA]
 * 
 * To run the tests, use the command: npm test -- apps/backend/src/user/service/user.service.spec.ts
 * 
 */

describe('UserService', ()=> {
    let userService: UserService;
    let userRepository: UserRepository
    const mockUserRepository = {
        findOne: jest.fn(), 
        createUser: jest.fn(),
        deleteUser: jest.fn(),
        updateUser: jest.fn(),
        save: jest.fn(),        // ← NOVO
        populate: jest.fn(),    // ← NOVO
    };

    beforeEach(async () => {
      
      jest.clearAllMocks()
        // create testing environment before each it
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: UserRepository,
            // methods testing will have access to
            useValue: mockUserRepository,
          },
        ],
      }).compile();

      // Instantiate service and repository
      userService = module.get<UserService>(UserService);
      userRepository = module.get<UserRepository>(UserRepository);
  });
    

  it('should define userService and userRepository', ()=> {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  })


  it('createUser -> should create a new user', async()=> {
    const mockUser = { 
        firebaseUid: 'user_test0000000000000001',
        username: 'mockUser',
        email: 'mockUser@example.com',
        role: 'member'};


    jest.spyOn(userRepository, 'createUser').mockResolvedValue(mockUser as any); 
    const user = await userService.createUser(mockUser as any)
    

    expect(user).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith(mockUser)
  })


  it('createUser -> should throw bad request exception if no params provided', async()=> {
    jest.spyOn(userRepository, 'createUser').mockImplementation().mockRejectedValue(new BadRequestException())
    await expect(userService.createUser({} as any)).rejects.toThrow(BadRequestException);
    })


  it('getUser -> should return user by firebaseUid', async()=> {
    
    const firebaseUid = 'user_test0000000000000001'
    const mockUserResponse = { firebaseUid: firebaseUid, username: 'tester' };

    // Mock the getUser method from userService to return the mockUser
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserResponse as any);
    const user = await userService.getUser({firebaseUid})
    
    expect(user?.firebaseUid).toEqual(firebaseUid);
    expect(userRepository.findOne).toHaveBeenCalledWith({firebaseUid});
    expect(userRepository.findOne).toHaveBeenCalledTimes(1);
  })


  it('getUser -> should return NULL if user not found', async()=> {
    const mockUser = {firebaseUid: "", username:"random user"};

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    const user = await userService.getUser(mockUser)
    
    expect(user).toBeNull;
    expect(userRepository.findOne).toHaveBeenCalledWith({username: "random user"})
    expect(userRepository.findOne).toHaveBeenCalledTimes(1)
  })


  it ('updateUser -> should return new document version stored on db', async ()=> {
    let mockUser = {firebaseUid: 'user_test0000000000000001', username: 'mockUser', bio: 'mock bio',};
    const newMockUser = {firebaseUid: 'user_test0000000000000001', username: 'mockUser', bio: 'new mock bio',}

    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(newMockUser as any)
    mockUser = await userService.updateUser(newMockUser)
    
    expect(mockUser).toEqual(newMockUser)
    expect(userRepository.updateUser).toHaveBeenCalledWith(newMockUser.firebaseUid, expect.objectContaining({username: "mockUser" }));
    expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
  })


  it('updateUser -> should throw bad request exception if no params provided',async()=> {
    jest.spyOn(userRepository, "updateUser").mockRejectedValue(new BadRequestException())
    
    await expect(userService.updateUser("" as any)).rejects.toThrow(BadRequestException)
  })


  it('updateUser -> should throw type error if no params provided',async()=> {
    jest.spyOn(userRepository, "updateUser").mockRejectedValue(new TypeError())
    
    await expect(userService.updateUser(undefined as any)).rejects.toThrow(TypeError)
  })


  it('deleteUser -> should successfully delete the user when a valid UID is provided', async () => {
    const mockUser = {
        firebaseUid: 'user_test0000000000000001',
        username: 'mockUser',
        email: 'mockUser@example.com',
        role: 'member',
        bio: 'mock bio',
        profilePicture: 'https://example.com/images/mock.jpg',
    };
    
    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(mockUser as any);
    const result = await userService.deleteUser(mockUser.firebaseUid as any);


    expect(result.firebaseUid).toEqual(mockUser.firebaseUid);
    expect(userRepository.deleteUser).toHaveBeenCalledWith(mockUser.firebaseUid);
    expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
  });


  it('deleteUser -> should throw BadRequestException if no UID is passed', async () => {
    jest.spyOn(userRepository, 'deleteUser').mockRejectedValue(new BadRequestException());

    await expect(userService.deleteUser({ firebaseUid: '' })).rejects.toThrow(BadRequestException);
  });


  // ==== TEST - FAVORITES ====

  it('addToFavorites -> should add place to favorites', async () => {
    const userId = 'user_test0000000000000001';
    const placeId = 'place_456';
    const mockUser = { 
      firebaseUid: userId, 
      favorites: [],
      save: jest.fn()
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, favorites: [placeId] } as any);

    const result = await userService.addToFavorites(userId, placeId);

    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid: userId });
    expect(userRepository.save).toHaveBeenCalled();
  });


  it('addToFavorites -> should throw NotFoundException if user not found', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(userService.addToFavorites('invalid_user', 'place_123')).rejects.toThrow();
  });


  it('getFavorites -> should return user favorites', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = { 
      firebaseUid: userId, 
      favorites: ['place_1', 'place_2']
    };
    const mockPopulatedUser = {
      ...mockUser,
      favorites: [
        { name: 'Place 1', address: 'Address 1' },
        { name: 'Place 2', address: 'Address 2' }
      ]
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'populate').mockResolvedValue(mockPopulatedUser as any);

    const result = await userService.getFavorites(userId);

    expect(result).toEqual(mockPopulatedUser.favorites);
    expect(userRepository.populate).toHaveBeenCalledWith(mockUser, {
      path: 'favorites',
      select: 'name address category customImages averageUserRating'
    });
  });


  it('removeFromFavorites -> should remove place from favorites', async () => {
    const userId = 'user_test0000000000000001';
    const placeId = 'place_456';
    const mockUser = { 
      firebaseUid: userId, 
      favorites: [placeId, 'place_789']
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, favorites: ['place_789'] } as any);

    await userService.removeFromFavorites(userId, placeId);

    expect(userRepository.save).toHaveBeenCalled();
  });


  // ==== TEST - WISHLIST ====

  it('addToWishlist -> should add place to wishlist', async () => {
    const userId = 'user_test0000000000000001';
    const placeId = 'place_456';
    const mockUser = { 
      firebaseUid: userId, 
      wishlist: []
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, wishlist: [placeId] } as any);

    const result = await userService.addToWishlist(userId, placeId);

    expect(userRepository.findOne).toHaveBeenCalledWith({ firebaseUid: userId });
    expect(userRepository.save).toHaveBeenCalled();
  });


  it('getWishlist -> should return user wishlist', async () => {
    const userId = 'user_test0000000000000001';
    const mockUser = { 
      firebaseUid: userId, 
      wishlist: ['place_1', 'place_2']
    };
    const mockPopulatedUser = {
      ...mockUser,
      wishlist: [
        { name: 'Place 1', address: 'Address 1' },
        { name: 'Place 2', address: 'Address 2' }
      ]
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
      banReason: undefined
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ 
      ...mockUser, 
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason
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
      banReason: 'Spam'
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ 
      ...mockUser, 
      isBanned: false,
      bannedAt: undefined,
      banReason: undefined
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
      isSuspended: false
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ 
      ...mockUser, 
      isSuspended: true,
      suspendedUntil: suspendedUntil,
      banReason: reason
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
      banReason: 'Test'
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue({ 
      ...mockUser, 
      isSuspended: false,
      suspendedUntil: undefined,
      banReason: undefined
    } as any);

    const result = await userService.unsuspendUser(userId);

    expect(result.isSuspended).toBe(false);
    expect(userRepository.save).toHaveBeenCalled();
  });
  
})
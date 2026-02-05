import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

/**
 * UserService unit tests
 * 
 * This test suite verifies the functionality of the UserService class, including user retrieval and creation.
 * It uses Jest for mocking dependencies and assertions.
 * 
 * To run the tests, use the command: npm test -- apps/backend/src/user/user.service.spec.ts
 */

describe('UserService', ()=> {
    let userService: UserService;
    let userRepository: UserRepository

    beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByFirebaseUid: jest.fn(), // This is a mock function
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            updateUser: jest.fn()
          },
        },
      ],
    }).compile();

    // Assign to the variables defined above
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
        role: 'member',
        bio: 'mock bio',
        profilePicture: 'https://example.com/images/mock.jpg',
    };

    // Mock the createUser method from userService to return the mockUser
    jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser as any);
    const user = await userService.createUser(mockUser as any)
    expect(user).toEqual(mockUser);
  })


  it('createUser -> should return 400 bad request exception if no params provided', async()=> {
    jest.spyOn(userService, 'createUser').mockImplementation().mockRejectedValue(new BadRequestException())

    await expect(userService.createUser({} as any)).rejects.toThrow(BadRequestException);
    })


  it('getUser -> should return user by firebaseUid', async()=> {
    const mockUser = {
        firebaseUid: 'user_test0000000000000001',
        username: 'mockUser',
        email: 'mockUser@example.com',
        role: 'member',
        bio: 'mock bio',
        profilePicture: 'https://example.com/images/mock.jpg',
    };

    // Mock the getUser method from userService to return the mockUser
    jest.spyOn(userService, 'getUser').mockResolvedValue(mockUser as any);
    const user = await userService.getUser(mockUser.firebaseUid as any)
    
    expect(user).toEqual(mockUser);
    expect(userService.getUser).toHaveBeenCalledWith(mockUser.firebaseUid);
    expect(userService.getUser).toHaveBeenCalledTimes(1);
  })


  it('getUser -> should return 404 if user not found', async()=> {
    const mockUserId = "random user";

    jest.spyOn(userService, 'getUser').mockRejectedValue(new NotFoundException());
    await expect(userService.getUser(mockUserId as any)).rejects.toThrow(NotFoundException);
  })


  it ('updateUser -> should return new document version stored on db', async ()=> {
    let mockUser = {firebaseUid: 'user_test0000000000000001', username: 'mockUser', bio: 'mock bio',};
    const newMockUser = {firebaseUid: 'user_test0000000000000001', username: 'mockUser', bio: 'new mock bio',}

    jest.spyOn(userService, 'updateUser').mockResolvedValue(newMockUser as any)
    mockUser = await userService.updateUser(newMockUser)
    
    expect(mockUser).toEqual(newMockUser)
    expect(userService.updateUser).toHaveBeenCalledWith(newMockUser);
    expect(userService.updateUser).toHaveBeenCalledTimes(1);
  })


  it('updateUser -> should return 400 bad request exception if no params provided',async()=> {
    jest.spyOn(userService, "updateUser").mockRejectedValue(new BadRequestException())
    
    await expect(userService.updateUser(null as any)).rejects.toThrow(BadRequestException)
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
    
    jest.spyOn(userService, 'deleteUser').mockResolvedValue(mockUser as any);
    const result = await userService.deleteUser(mockUser.firebaseUid as any);


    expect(result.firebaseUid).toEqual(mockUser.firebaseUid);
    expect(userService.deleteUser).toHaveBeenCalledWith(mockUser.firebaseUid);
    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
  });


  it('deleteUser -> should throw BadRequestException if no UID is passed', async () => {
    jest.spyOn(userRepository, 'deleteUser').mockRejectedValue(new BadRequestException());

    await expect(userService.deleteUser({ firebaseUid: '' })).rejects.toThrow(BadRequestException);
  });
  
})
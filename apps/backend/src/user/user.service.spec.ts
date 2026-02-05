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
 * these tests follow the triple A of testing: Arrange, act and assert [AAA]
 * 
 * To run the tests, use the command: npm test -- apps/backend/src/user/user.service.spec.ts
 * 
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
            findOne: jest.fn(), // This is a mock function
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
        role: 'member',};


    jest.spyOn(userRepository, 'createUser').mockResolvedValue(mockUser as any); 
    const user = await userService.createUser(mockUser as any)
    

    expect(user).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith(mockUser)
  })


  it('createUser -> should return 400 bad request exception if no params provided', async()=> {
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


  it('getUser -> should return 404 if user not found', async()=> {
    const mockUserId = {firebaseUid: "", username:"random user"};

    jest.spyOn(userRepository, 'findOne').mockRejectedValue(new NotFoundException());
    await expect(userService.getUser(mockUserId as any)).rejects.toThrow(NotFoundException);
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
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            updateUser: jest.fn(),
          },
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

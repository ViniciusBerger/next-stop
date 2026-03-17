import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../service/profile.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * ProfileController Unit Tests
 *
 * To run: npm test -- apps/backend/src/profile/controller/profile.controller.spec.ts
 */
describe('ProfileController - Unit Test', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfile = {
    firebaseUid: 'firebase_uid_123',
    username: 'testuser',
    profile: {
      bio: 'Test bio',
      profilePicture: 'https://example.com/pic.jpg',
      preferences: {
        cuisine: ['Italian', 'Japanese'],
        atmosphere: ['Casual'],
        dietaryRestrictions: [],
      },
      privacy: {
        profileVisibility: 'Public',
        showFavorites: true,
      },
    },
    toObject: function () {
      return this;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile by firebaseUid', async () => {
      const dto = { firebaseUid: 'firebase_uid_123' };
      jest.spyOn(service, 'getProfile').mockResolvedValue(mockProfile as any);

      const result = await controller.getProfile(dto);

      expect(result).toBeDefined();
      expect(service.getProfile).toHaveBeenCalledWith(dto);
    });

    it('should return profile by username', async () => {
      const dto = { username: 'testuser' };
      jest.spyOn(service, 'getProfile').mockResolvedValue(mockProfile as any);

      const result = await controller.getProfile(dto);

      expect(result).toBeDefined();
      expect(service.getProfile).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if no identifier provided', async () => {
      const dto = {};

      await expect(controller.getProfile(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no identifier provided', async () => {
      const dto = {} as any;

      await expect(controller.getProfile(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update preferences', async () => {
      const getDto = { firebaseUid: 'firebase_uid_123' };
      const updateDto = {
        preferences: {
          cuisine: ['Mexican', 'Chinese'],
        },
      } as any;

      jest
        .spyOn(service, 'updateProfile')
        .mockResolvedValue(mockProfile as any);

      const result = await controller.updateProfile(getDto, updateDto);

      expect(result).toBeDefined();
      expect(service.updateProfile).toHaveBeenCalledWith(getDto, updateDto);
    });

    it('should update privacy settings', async () => {
      const getDto = { firebaseUid: 'firebase_uid_123' };
      const updateDto = {
        privacy: {
          profileVisibility: 'Private' as any,
          showFavorites: false,
        },
      } as any;

      jest
        .spyOn(service, 'updateProfile')
        .mockResolvedValue(mockProfile as any);

      const result = await controller.updateProfile(getDto, updateDto);

      expect(result).toBeDefined();
      expect(service.updateProfile).toHaveBeenCalledWith(getDto, updateDto);
    });

    it('should update both preferences and privacy', async () => {
      const getDto = { username: 'testuser' };
      const updateDto = {
        preferences: {
          cuisine: ['Italian'],
        },
        privacy: {
          profileVisibility: 'Public' as any,
        },
      } as any;

      jest
        .spyOn(service, 'updateProfile')
        .mockResolvedValue(mockProfile as any);

      const result = await controller.updateProfile(getDto, updateDto);

      expect(result).toBeDefined();
      expect(service.updateProfile).toHaveBeenCalledWith(getDto, updateDto);
    });

    it('should throw BadRequestException if no identifier provided', async () => {
      const getDto = {};
      const updateDto = { preferences: { cuisine: ['Italian'] } } as any;

      await expect(controller.updateProfile(getDto, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no update data provided', async () => {
      const getDto = { firebaseUid: 'firebase_uid_123' };
      const updateDto = {} as any;

      await expect(controller.updateProfile(getDto, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no identifier provided', async () => {
      const getDto = {} as any;
      const updateDto = { preferences: { cuisine: ['Italian'] } } as any;

      await expect(controller.updateProfile(getDto, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { ProfileRepository } from '../repository/profile.repository';
import { NotFoundException } from '@nestjs/common';

/**
 * ProfileService Unit Tests
 * 
 * Tests the service layer with mocked repository.
 * Follows the same pattern as UserService tests.
 * 
 * To run: npm test -- apps/backend/src/profile/service/profile.service.spec.ts
 */
describe('ProfileService - Unit Test', () => {
  let service: ProfileService;
  let repository: ProfileRepository;

  const mockUser = {
    firebaseUid: 'service_test_123',
    username: 'testuser',
    email: 'test@example.com',
    profile: {
      preferences: { 
        cuisine: '',
        dietaryLabels: '',
        allergies: '',
        activities: ''
      },
      privacy: { 
        activityFeed: 'Friends',
        favorites: 'Friends',
        myEvents: 'Friends',
        badges: 'Friends',
        preferences: 'Friends'
      }
    },
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile by firebaseUid', async () => {
      const dto = { firebaseUid: 'service_test_123' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.getProfile(dto);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ firebaseUid: 'service_test_123' });
    });

    it('should return user profile by username', async () => {
      const dto = { username: 'testuser' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.getProfile(dto);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should throw NotFoundException if user not found', async () => {
      const dto = { firebaseUid: 'ghost' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getProfile(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update cuisine preference', async () => {
      const getDto = { firebaseUid: 'service_test_123' };
      const updateDto = { preferences: { cuisine: 'Italian' } };
      
      const updatedUser = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          preferences: { ...mockUser.profile.preferences, cuisine: 'Italian' }
        }
      };

      jest.spyOn(repository, 'update').mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile(getDto, updateDto);

      expect(result.profile?.preferences?.cuisine).toBe('Italian');
      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'service_test_123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'profile.preferences.cuisine': 'Italian'
          })
        })
      );
    });

    it('should update multiple preferences at once', async () => {
      const getDto = { firebaseUid: 'service_test_123' };
      const updateDto = { 
        preferences: { 
          cuisine: 'Japanese',
          dietaryLabels: 'Vegetarian',
          allergies: 'Nuts'
        } 
      };
      
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      await service.updateProfile(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'service_test_123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'profile.preferences.cuisine': 'Japanese',
            'profile.preferences.dietaryLabels': 'Vegetarian',
            'profile.preferences.allergies': 'Nuts'
          })
        })
      );
    });

    it('should update privacy settings', async () => {
      const getDto = { firebaseUid: 'service_test_123' };
      const updateDto = { 
        privacy: { 
          activityFeed: 'None',
          favorites: 'All'
        } 
      };
      
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      await service.updateProfile(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { firebaseUid: 'service_test_123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'profile.privacy.activityFeed': 'None',
            'profile.privacy.favorites': 'All'
          })
        })
      );
    });

    it('should update both preferences and privacy', async () => {
      const getDto = { username: 'testuser' };
      const updateDto = { 
        preferences: { cuisine: 'Mexican' },
        privacy: { myEvents: 'Friends' }
      };
      
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      await service.updateProfile(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { username: 'testuser' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'profile.preferences.cuisine': 'Mexican',
            'profile.privacy.myEvents': 'Friends'
          })
        })
      );
    });

    it('should update updatedAt timestamp', async () => {
      const getDto = { firebaseUid: 'service_test_123' };
      const updateDto = { preferences: { cuisine: 'Thai' } };
      
      jest.spyOn(repository, 'update').mockResolvedValue(mockUser as any);

      await service.updateProfile(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            updatedAt: expect.any(Date)
          })
        })
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const getDto = { firebaseUid: 'ghost' };
      const updateDto = { preferences: { cuisine: 'Italian' } };
      
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.updateProfile(getDto, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });
});
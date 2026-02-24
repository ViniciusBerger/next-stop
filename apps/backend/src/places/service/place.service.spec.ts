import { Test, TestingModule } from '@nestjs/testing';
import { PlaceService } from './place.service';
import { PlaceRepository } from '../repository/place.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

/**
 * PlaceService Unit Tests
 * 
 * Tests the service layer with mocked repository.
 * 
 * To run: npm test -- apps/backend/src/places/service/place.service.spec.ts
 */
describe('PlaceService - Unit Test', () => {
  let service: PlaceService;
  let repository: PlaceRepository;

  const mockPlace = {
    _id: 'place_123',
    googlePlaceId: 'ChIJ_mock_001',
    name: 'Mock Restaurant',
    address: '123 Mock St',
    category: 'Restaurant',
    description: 'A mock restaurant',
    customImages: [],
    customTags: [],
    averageUserRating: 0,
    totalUserReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceService,
        {
          provide: PlaceRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlaceService>(PlaceService);
    repository = module.get<PlaceRepository>(PlaceRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createPlace', () => {
    it('should create a new place', async () => {
      const createDto = {
        googlePlaceId: 'ChIJ_new_001',
        name: 'New Restaurant',
        address: '456 New St',
        category: 'Restaurant',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockPlace as any);

      const result = await service.createPlace(createDto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_new_001' });
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if googlePlaceId already exists', async () => {
      const createDto = {
        googlePlaceId: 'ChIJ_duplicate',
        name: 'Duplicate',
        address: 'Address',
        category: 'Restaurant',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      await expect(service.createPlace(createDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getAllPlaces', () => {
    it('should return all places when no filter provided', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      const result = await service.getAllPlaces();

      expect(result).toHaveLength(1);
      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it('should filter by category', async () => {
      const dto = { category: 'Restaurant' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ category: 'Restaurant' });
    });

    it('should filter by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should search by name with regex', async () => {
      const dto = { name: 'Pizza' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        name: { $regex: 'Pizza', $options: 'i' }
      });
    });
  });

  describe('getPlace', () => {
    it('should return place by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should return place by id', async () => {
      const dto = { id: 'place_123' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({ _id: 'place_123' });
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'ghost' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getPlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlace', () => {
    it('should update place description', async () => {
      const getDto = { googlePlaceId: 'ChIJ_test' };
      const updateDto = { description: 'Updated description' };

      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockPlace,
        description: 'Updated description'
      } as any);

      const result = await service.updatePlace(getDto, updateDto);

      expect(result.description).toBe('Updated description');
      expect(repository.update).toHaveBeenCalledWith(
        { googlePlaceId: 'ChIJ_test' },
        expect.objectContaining({
          $set: expect.objectContaining({
            description: 'Updated description'
          })
        })
      );
    });

    it('should update custom images', async () => {
      const getDto = { id: 'place_123' };
      const updateDto = { customImages: ['img1.jpg', 'img2.jpg'] };

      jest.spyOn(repository, 'update').mockResolvedValue(mockPlace as any);

      await service.updatePlace(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { _id: 'place_123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            customImages: ['img1.jpg', 'img2.jpg']
          })
        })
      );
    });

    it('should update rating and review count', async () => {
      const getDto = { googlePlaceId: 'ChIJ_test' };
      const updateDto = { averageUserRating: 4.5, totalUserReviews: 10 };

      jest.spyOn(repository, 'update').mockResolvedValue(mockPlace as any);

      await service.updatePlace(getDto, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            averageUserRating: 4.5,
            totalUserReviews: 10
          })
        })
      );
    });

    it('should throw NotFoundException if place not found', async () => {
      const getDto = { googlePlaceId: 'ghost' };
      const updateDto = { description: 'test' };

      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.updatePlace(getDto, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlace', () => {
    it('should delete place and return message', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' };
      jest.spyOn(repository, 'delete').mockResolvedValue(mockPlace as any);

      const result = await service.deletePlace(dto);

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('Mock Restaurant');
      expect(repository.delete).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'ghost' };
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      await expect(service.deletePlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlaceRating', () => {
    it('should update place rating and review count', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(mockPlace as any);

      await service.updatePlaceRating('place_123', 4.5, 20);

      expect(repository.update).toHaveBeenCalledWith(
        { _id: 'place_123' },
        {
          $set: {
            averageUserRating: 4.5,
            totalUserReviews: 20,
            updatedAt: expect.any(Date)
          }
        }
      );
    });
  });
});
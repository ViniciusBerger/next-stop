import { Test, TestingModule } from '@nestjs/testing';
import { PlaceService } from './place.service';
import { PlaceRepository } from '../repository/place.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Place } from '../schemas/place.schema';

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

  const mockPlaceModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
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
            findById: jest.fn(),
            findNearby: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getModelToken(Place.name),
          useValue: mockPlaceModel,
        },
      ],
    }).compile();

    service = module.get<PlaceService>(PlaceService);
    repository = module.get<PlaceRepository>(PlaceRepository);

    jest.clearAllMocks();
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
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockPlace as any);

      const result = await service.createPlace(createDto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({
        googlePlaceId: 'ChIJ_new_001',
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should return existing place if googlePlaceId already exists', async () => {
      const createDto = {
        googlePlaceId: 'ChIJ_duplicate',
        name: 'Duplicate',
        address: 'Address',
        category: 'Restaurant',
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.createPlace(createDto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({
        googlePlaceId: 'ChIJ_duplicate',
      });
      expect(repository.create).not.toHaveBeenCalled();
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
      const dto = { category: 'Restaurant' } as any;
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        category: 'Restaurant',
      });
    });

    it('should filter by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' } as any;
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        googlePlaceId: 'ChIJ_test',
      });
    });
  });

  describe('getPlace', () => {
    it('should return place by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test_001' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({
        googlePlaceId: 'ChIJ_test_001',
      });
    });

    it('should return place by _id', async () => {
      const dto = { _id: 'place_123' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({ _id: 'place_123' });
    });

    it('should return null if place not found', async () => {
      const dto = { googlePlaceId: 'nonexistent' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.getPlace(dto);

      expect(result).toBeNull();
    });
  });

  describe('updatePlace', () => {
    it('should update place description', async () => {
      const dto = {
        googlePlaceId: 'ChIJ_test_001',
        description: 'Updated description',
      };

      const updatedPlace = { ...mockPlace, description: 'Updated description' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedPlace as any);

      const result = await service.updatePlace(dto);

      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({
        googlePlaceId: 'ChIJ_test_001',
      });
      expect(repository.update).toHaveBeenCalledWith(
        { googlePlaceId: 'ChIJ_test_001' },
        { $set: { description: 'Updated description' } },
      );
    });

    it('should update custom images', async () => {
      const dto = {
        _id: 'place_123',
        customImages: ['img1.jpg', 'img2.jpg'],
      };

      const updatedPlace = {
        ...mockPlace,
        customImages: ['img1.jpg', 'img2.jpg'],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedPlace as any);

      const result = await service.updatePlace(dto);

      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({ _id: 'place_123' });
      expect(repository.update).toHaveBeenCalledWith(
        { _id: 'place_123' },
        { $set: { customImages: ['img1.jpg', 'img2.jpg'] } },
      );
    });
  });

  describe('deletePlace', () => {
    it('should delete place and return message', async () => {
      const googlePlaceId = 'ChIJ_test_001';

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined as any);

      const result = await service.deletePlace(googlePlaceId);

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('Mock Restaurant');
      expect(repository.findOne).toHaveBeenCalledWith({ googlePlaceId });
      expect(repository.delete).toHaveBeenCalledWith({ googlePlaceId });
    });

    it('should throw NotFoundException if place not found', async () => {
      const googlePlaceId = 'nonexistent';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.deletePlace(googlePlaceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllPlaces - with filters', () => {
    it('should filter by priceLevel', async () => {
      const dto = { priceLevel: 2 };

      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        priceLevel: 2,
      });
    });
  });
});

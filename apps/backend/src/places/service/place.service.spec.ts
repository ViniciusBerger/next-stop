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

  // Mock do PlaceModel
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
            findNearby: jest.fn(), // ← ADICIONAR
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getModelToken(Place.name), // ← ADICIONAR
          useValue: mockPlaceModel,
        },
      ],
    }).compile();

    service = module.get<PlaceService>(PlaceService);
    repository = module.get<PlaceRepository>(PlaceRepository);

    jest.clearAllMocks(); // ← ADICIONAR
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
      } as any; // ← ADICIONAR 'as any'

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
      } as any; // ← ADICIONAR 'as any'

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
      const dto = { category: 'Restaurant' } as any;
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ category: 'Restaurant' });
    });

    it('should filter by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' } as any;
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should search by name with regex', async () => {
      const dto = { name: 'Pizza' } as any;
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        name: { $regex: 'Pizza', $options: 'i' }
      });
    });
  });

  describe('getPlace', () => {
    it('should return place by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlace as any);

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findOne).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should return place by id', async () => {
      const dto = { id: 'place_123' } as any;
      jest.spyOn(repository, 'findById').mockResolvedValue(mockPlace as any); // ← CORRIGIR

      const result = await service.getPlace(dto);

      expect(result).toEqual(mockPlace);
      expect(repository.findById).toHaveBeenCalledWith('place_123'); // ← CORRIGIR
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'ghost' } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getPlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlace', () => {
    it('should update place description', async () => {
      const getDto = { googlePlaceId: 'ChIJ_test' } as any;
      const updateDto = { description: 'Updated description' } as any; // ← ADICIONAR 'as any'

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
      const getDto = { id: 'place_123' } as any;
      const updateDto = { customImages: ['img1.jpg', 'img2.jpg'] } as any; // ← ADICIONAR 'as any'

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

    it('should throw NotFoundException if place not found', async () => {
      const getDto = { googlePlaceId: 'ghost' } as any;
      const updateDto = { description: 'test' } as any;

      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.updatePlace(getDto, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlace', () => {
    it('should delete place and return message', async () => {
      const dto = { googlePlaceId: 'ChIJ_test' } as any;
      jest.spyOn(repository, 'delete').mockResolvedValue(mockPlace as any);

      const result = await service.deletePlace(dto);

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('Mock Restaurant');
      expect(repository.delete).toHaveBeenCalledWith({ googlePlaceId: 'ChIJ_test' });
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'ghost' } as any;
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      await expect(service.deletePlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ============== NEW FILTER TEST ==============
  describe('getAllPlaces - with filters', () => {
    it('should filter by maxPriceLevel', async () => {
      const dto = { maxPriceLevel: 2 } as any;
      
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findMany).toHaveBeenCalledWith({
        priceLevel: { $lte: 2 }
      });
    });

    it('should find places by proximity', async () => {
      const dto = {
        latitude: 49.2827,
        longitude: -123.1207,
        radiusMeters: 5000,
      } as any;

      jest.spyOn(repository, 'findNearby').mockResolvedValue([mockPlace] as any);

      const result = await service.getAllPlaces(dto);

      expect(repository.findNearby).toHaveBeenCalledWith(
        49.2827,
        -123.1207,
        5000,
        {}
      );
      expect(result).toHaveLength(1);
    });

    it('should find places by proximity with category filter', async () => {
      const dto = {
        latitude: 49.2827,
        longitude: -123.1207,
        radiusMeters: 5000,
        category: 'Restaurant',
      } as any;

      jest.spyOn(repository, 'findNearby').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findNearby).toHaveBeenCalledWith(
        49.2827,
        -123.1207,
        5000,
        { category: 'Restaurant' }
      );
    });

    it('should find places by proximity with price filter', async () => {
      const dto = {
        latitude: 49.2827,
        longitude: -123.1207,
        maxPriceLevel: 2,
      } as any;

      jest.spyOn(repository, 'findNearby').mockResolvedValue([mockPlace] as any);

      await service.getAllPlaces(dto);

      expect(repository.findNearby).toHaveBeenCalledWith(
        49.2827,
        -123.1207,
        5000, // default radius
        { priceLevel: { $lte: 2 } }
      );
    });
  });
});
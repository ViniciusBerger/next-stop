import { Test, TestingModule } from '@nestjs/testing';
import { PlaceController } from './place.controller';
import { PlaceService } from '../service/place.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

/**
 * PlaceController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/places/controller/place.controller.spec.ts
 */
describe('PlaceController - Unit Test', () => {
  let controller: PlaceController;
  let service: PlaceService;

  const mockPlace = {
    _id: 'place_123',
    googlePlaceId: 'ChIJ_test_001',
    name: 'Test Restaurant',
    address: '123 Test St',
    category: 'Restaurant',
    description: 'A test restaurant',
    customImages: [],
    customTags: [],
    averageUserRating: 0,
    totalUserReviews: 0,
    createdBy: 'user_123',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function() { return this; }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceController],
      providers: [
        {
          provide: PlaceService,
          useValue: {
            createPlace: jest.fn(),
            getAllPlaces: jest.fn(),
            getPlace: jest.fn(),
            updatePlace: jest.fn(),
            deletePlace: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlaceController>(PlaceController);
    service = module.get<PlaceService>(PlaceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createPlace', () => {
    it('should create a new place', async () => {
      const createDto = {
        googlePlaceId: 'ChIJ_new_001',
        name: 'New Restaurant',
        address: '456 New St',
        category: 'Restaurant',
        createdBy: 'user_123',
      } as any;

      jest.spyOn(service, 'createPlace').mockResolvedValue(mockPlace as any);

      const result = await controller.createPlace(createDto);

      expect(result).toBeDefined();
      expect(service.createPlace).toHaveBeenCalledWith(createDto);
    });

    it('should handle ConflictException for duplicate googlePlaceId', async () => {
      const createDto = {
        googlePlaceId: 'ChIJ_duplicate',
        name: 'Duplicate',
        address: 'Address',
        category: 'Restaurant',
      } as any;

      jest.spyOn(service, 'createPlace').mockRejectedValue(new ConflictException());

      await expect(controller.createPlace(createDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getPlaces', () => {
    it('should return all places when no filter provided', async () => {
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces();

      expect(result).toHaveLength(1);
      expect(service.getAllPlaces).toHaveBeenCalled();
    });

    it('should filter places by category', async () => {
      const dto = { category: 'Restaurant' } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });

    it('should filter places by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test_001' } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });
  });

  describe('getPlace', () => {
    it('should return place by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test_001' } as any;
      jest.spyOn(service, 'getPlace').mockResolvedValue(mockPlace as any);

      const result = await controller.getPlace(dto);

      expect(result).toBeDefined();
      expect(service.getPlace).toHaveBeenCalledWith(dto);
    });

    it('should filter places by maxPriceLevel', async () => {
      const dto = { maxPriceLevel: 2 } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });

    it('should filter places by location proximity', async () => {
      const dto = {
        latitude: 49.2827,
        longitude: -123.1207,
        radiusMeters: 5000,
      } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });

    it('should filter places by combined filters (location + category + price)', async () => {
      const dto = {
        latitude: 49.2827,
        longitude: -123.1207,
        radiusMeters: 3000,
        category: 'Restaurant',
        maxPriceLevel: 2,
      } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });

    it('should return place by id', async () => {
      const dto = { id: 'place_123' } as any;
      jest.spyOn(service, 'getPlace').mockResolvedValue(mockPlace as any);

      const result = await controller.getPlace(dto);

      expect(result).toBeDefined();
      expect(service.getPlace).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if no params provided', async () => {
      const dto = {} as any;

      await expect(controller.getPlace(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'nonexistent' } as any;
      jest.spyOn(service, 'getPlace').mockRejectedValue(new NotFoundException());

      await expect(controller.getPlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlace', () => {
    it('should update place description', async () => {
      const getDto = { googlePlaceId: 'ChIJ_test_001' } as any;
      const updateDto = { description: 'Updated description' } as any;

      jest.spyOn(service, 'updatePlace').mockResolvedValue(mockPlace as any);

      const result = await controller.updatePlace(getDto, updateDto);

      expect(result).toBeDefined();
      expect(service.updatePlace).toHaveBeenCalledWith(getDto, updateDto);
    });

    it('should update custom images', async () => {
      const getDto = { id: 'place_123' } as any;
      const updateDto = { customImages: ['img1.jpg', 'img2.jpg'] } as any;

      jest.spyOn(service, 'updatePlace').mockResolvedValue(mockPlace as any);

      const result = await controller.updatePlace(getDto, updateDto);

      expect(result).toBeDefined();
      expect(service.updatePlace).toHaveBeenCalledWith(getDto, updateDto);
    });

    it('should throw BadRequestException if no params provided', async () => {
      const getDto = {} as any;
      const updateDto = { description: 'test' } as any;

      await expect(controller.updatePlace(getDto, updateDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if place not found', async () => {
      const getDto = { googlePlaceId: 'nonexistent' } as any;
      const updateDto = { description: 'test' } as any;

      jest.spyOn(service, 'updatePlace').mockRejectedValue(new NotFoundException());

      await expect(controller.updatePlace(getDto, updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlace', () => {
    it('should delete place', async () => {
      const dto = { googlePlaceId: 'ChIJ_test_001' } as any;
      const deleteResult = { deleted: true, message: 'Place deleted' };

      jest.spyOn(service, 'deletePlace').mockResolvedValue(deleteResult);

      const result = await controller.deletePlace(dto);

      expect(result.deleted).toBe(true);
      expect(service.deletePlace).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if no params provided', async () => {
      const dto = {} as any;

      await expect(controller.deletePlace(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if place not found', async () => {
      const dto = { googlePlaceId: 'nonexistent' } as any;

      jest.spyOn(service, 'deletePlace').mockRejectedValue(new NotFoundException());

      await expect(controller.deletePlace(dto))
        .rejects.toThrow(NotFoundException);
    });
  });
});
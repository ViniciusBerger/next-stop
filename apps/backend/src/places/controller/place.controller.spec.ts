import { Test, TestingModule } from '@nestjs/testing';
import { PlaceController } from './place.controller';
import { PlaceService } from '../service/place.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GooglePlacesService } from '../service/google-places.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';

/**
 * PlaceController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/places/controller/place.controller.spec.ts
 */
describe('PlaceController - Unit Test', () => {
  let controller: PlaceController;
  let service: PlaceService;
  let googlePlacesService: GooglePlacesService;

  const mockPlaceService = {
    createPlace: jest.fn(),
    getAllPlaces: jest.fn(),
    getPlace: jest.fn(),
    updatePlace: jest.fn(),
    deletePlace: jest.fn(),
  };

  const mockGooglePlacesService = {
    searchPlaces: jest.fn(),
    searchNearby: jest.fn(),
    getPlaceDetails: jest.fn(),
    geocodeAddress: jest.fn(),
    getPhotoUrl: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-api-key'),
  };

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
          provide: FirebaseAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: PlaceService,
          useValue: mockPlaceService,
        },
        {
          provide: GooglePlacesService,
          useValue: mockGooglePlacesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<PlaceController>(PlaceController);
    service = module.get<PlaceService>(PlaceService);
    googlePlacesService = module.get<GooglePlacesService>(GooglePlacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(googlePlacesService).toBeDefined();
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
  });

  describe('getAllPlaces', () => {
    it('should return all places when no filter provided', async () => {
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getAllPlaces();

      expect(result).toHaveLength(1);
      expect(service.getAllPlaces).toHaveBeenCalled();
    });

    it('should filter places by category', async () => {
      const dto = { category: 'Restaurant' } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getAllPlaces(dto);

      expect(result).toBeDefined();
      expect(service.getAllPlaces).toHaveBeenCalledWith(dto);
    });

    it('should filter places by googlePlaceId', async () => {
      const dto = { googlePlaceId: 'ChIJ_test_001' } as any;
      jest.spyOn(service, 'getAllPlaces').mockResolvedValue([mockPlace] as any);

      const result = await controller.getAllPlaces(dto);

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

    it('should return place by _id', async () => {
      const dto = { _id: 'place_123' } as any;
      jest.spyOn(service, 'getPlace').mockResolvedValue(mockPlace as any);

      const result = await controller.getPlace(dto);

      expect(result).toBeDefined();
      expect(service.getPlace).toHaveBeenCalledWith(dto);
    });
  });

  describe('updatePlace', () => {
    it('should update place description', async () => {
      const updateDto = {
        googlePlaceId: 'ChIJ_test_001',
        description: 'Updated description'
      } as any;

      jest.spyOn(service, 'updatePlace').mockResolvedValue(mockPlace as any);

      const result = await controller.updatePlace(updateDto);

      expect(result).toBeDefined();
      expect(service.updatePlace).toHaveBeenCalledWith(updateDto);
    });

    it('should update custom images', async () => {
      const updateDto = {
        _id: 'place_123',
        customImages: ['img1.jpg', 'img2.jpg']
      } as any;

      jest.spyOn(service, 'updatePlace').mockResolvedValue(mockPlace as any);

      const result = await controller.updatePlace(updateDto);

      expect(result).toBeDefined();
      expect(service.updatePlace).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('deletePlace', () => {
    it('should delete place', async () => {
      const googlePlaceId = 'ChIJ_test_001';
      const deleteResult = { deleted: true, message: 'Place "Test Restaurant" deleted successfully' };

      jest.spyOn(service, 'deletePlace').mockResolvedValue(deleteResult);

      const result = await controller.deletePlace(googlePlaceId);

      expect(result.deleted).toBe(true);
      expect(service.deletePlace).toHaveBeenCalledWith(googlePlaceId);
    });

    it('should throw BadRequestException if googlePlaceId not provided', async () => {
      await expect(controller.deletePlace(undefined as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if place not found', async () => {
      const googlePlaceId = 'nonexistent';

      jest.spyOn(service, 'deletePlace').mockRejectedValue(new NotFoundException());

      await expect(controller.deletePlace(googlePlaceId))
        .rejects.toThrow(NotFoundException);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from '../service/review.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * ReviewController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/reviews/controller/review.controller.spec.ts
 */
describe('ReviewController - Unit Test', () => {
  let controller: ReviewController;
  let service: ReviewService;

  const mockReview = {
    _id: 'review_123',
    author: 'user_123',
    place: 'place_123',
    event: undefined,
    rating: 5,
    reviewText: 'Amazing place! Great food and service.',
    images: [],
    date: new Date('2026-01-15'),
    likes: 0,
    likedBy: [],
    createdAt: new Date(),
    toObject: function() { return this; }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: {
            createReview: jest.fn(),
            getAllReviews: jest.fn(),
            getReview: jest.fn(),
            getPlaceReviews: jest.fn(),
            getUserReviews: jest.fn(),
            deleteReview: jest.fn(),
            toggleLike: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const createDto = {
        author: 'user_new',
        place: 'place_new',
        rating: 5,
        reviewText: 'Excellent restaurant!',
        date: '2026-01-20',
      } as any;

      jest.spyOn(service, 'createReview').mockResolvedValue(mockReview as any);

      const result = await controller.createReview(createDto);

      expect(result).toBeDefined();
      expect(service.createReview).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getReviews', () => {
    it('should return all reviews', async () => {
      jest.spyOn(service, 'getAllReviews').mockResolvedValue([mockReview] as any);

      const result = await controller.getReviews();

      expect(result).toHaveLength(1);
      expect(service.getAllReviews).toHaveBeenCalled();
    });

    it('should filter reviews by place', async () => {
      const dto = { place: 'place_specific' } as any;
      jest.spyOn(service, 'getAllReviews').mockResolvedValue([mockReview] as any);

      const result = await controller.getReviews(dto);

      expect(result).toBeDefined();
      expect(service.getAllReviews).toHaveBeenCalledWith(dto);
    });

    it('should filter reviews by author', async () => {
      const dto = { author: 'user_specific' } as any;
      jest.spyOn(service, 'getAllReviews').mockResolvedValue([mockReview] as any);

      const result = await controller.getReviews(dto);

      expect(result).toBeDefined();
      expect(service.getAllReviews).toHaveBeenCalledWith(dto);
    });
  });

  describe('getReview', () => {
    it('should return review by id', async () => {
      const dto = { id: 'review_123' } as any;
      jest.spyOn(service, 'getReview').mockResolvedValue(mockReview as any);

      const result = await controller.getReview(dto);

      expect(result).toBeDefined();
      expect(service.getReview).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if no id provided', async () => {
      const dto = {} as any;

      await expect(controller.getReview(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if review not found', async () => {
      const dto = { id: 'nonexistent' } as any;
      jest.spyOn(service, 'getReview').mockRejectedValue(new NotFoundException());

      await expect(controller.getReview(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlaceReviews', () => {
    it('should return all reviews for a place', async () => {
      jest.spyOn(service, 'getPlaceReviews').mockResolvedValue([mockReview, mockReview] as any);

      const result = await controller.getPlaceReviews('place_123');

      expect(result).toHaveLength(2);
      expect(service.getPlaceReviews).toHaveBeenCalledWith('place_123');
    });
  });

  describe('getUserReviews', () => {
    it('should return all reviews by a user', async () => {
      jest.spyOn(service, 'getUserReviews').mockResolvedValue([mockReview] as any);

      const result = await controller.getUserReviews('user_123');

      expect(result).toHaveLength(1);
      expect(service.getUserReviews).toHaveBeenCalledWith('user_123');
    });
  });

  describe('deleteReview', () => {
    it('should delete review', async () => {
      const deleteResult = { deleted: true, message: 'Review deleted successfully' };

      jest.spyOn(service, 'deleteReview').mockResolvedValue(deleteResult);

      const result = await controller.deleteReview('review_123');

      expect(result.deleted).toBe(true);
      expect(service.deleteReview).toHaveBeenCalledWith('review_123');
    });

    it('should throw NotFoundException if review not found', async () => {
      jest.spyOn(service, 'deleteReview').mockRejectedValue(new NotFoundException());

      await expect(controller.deleteReview('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on review', async () => {
      const likeDto = {
        reviewId: 'review_123',
        userId: 'user_new',
      } as any;

      jest.spyOn(service, 'toggleLike').mockResolvedValue(mockReview as any);

      const result = await controller.toggleLike(likeDto);

      expect(result).toBeDefined();
      expect(service.toggleLike).toHaveBeenCalledWith(likeDto);
    });
  });
});
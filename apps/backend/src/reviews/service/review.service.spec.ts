import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { ReviewRepository } from '../repository/review.repository';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Review } from '../schema/review.schema';

/**
 * ReviewService Unit Tests
 * 
 * Tests the service layer with mocked repository and model.
 * 
 * To run: npm test -- apps/backend/src/reviews/service/review.service.spec.ts
 */
describe('ReviewService - Unit Test', () => {
  let service: ReviewService;
  let repository: ReviewRepository;

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

  // Mock do ReviewModel
  const mockReviewModel = {
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
        ReviewService,
        {
          provide: ReviewRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          // ← ADICIONAR MOCK DO MODEL
          provide: getModelToken(Review.name),
          useValue: mockReviewModel,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    repository = module.get<ReviewRepository>(ReviewRepository);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const createDto = {
        author: 'user_new',
        place: 'place_new',
        rating: 5,
        reviewText: 'Excellent restaurant!',
        date: '2026-01-20',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockReview as any);
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReview] as any);
      mockReviewModel.findById.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue(mockReview);

      const result = await service.createReview(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
    });
  });

  describe('getAllReviews', () => {
    it('should return all reviews when no filter provided', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReview] as any);
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview]);

      const result = await service.getAllReviews();

      expect(result).toHaveLength(1);
      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it('should filter by place', async () => {
      const dto = { place: 'place_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReview] as any);
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview]);

      await service.getAllReviews(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ place: 'place_specific' });
    });

    it('should filter by author', async () => {
      const dto = { author: 'user_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReview] as any);
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview]);

      await service.getAllReviews(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ author: 'user_specific' });
    });

    it('should filter by event', async () => {
      const dto = { event: 'event_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockReview] as any);
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview]);

      await service.getAllReviews(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ event: 'event_specific' });
    });
  });

  describe('getReview', () => {
    it('should return review by ID', async () => {
      const dto = { id: 'review_123' };
      mockReviewModel.findById.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue(mockReview);

      const result = await service.getReview(dto);

      expect(result).toEqual(mockReview);
    });

    it('should throw BadRequestException if no ID provided', async () => {
      const dto = {};

      await expect(service.getReview(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if review not found', async () => {
      const dto = { id: 'ghost_review' };
      mockReviewModel.findById.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue(null);

      await expect(service.getReview(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlaceReviews', () => {
    it('should return all reviews for a place', async () => {
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview, mockReview]);

      const result = await service.getPlaceReviews('place_123');

      expect(result).toHaveLength(2);
    });
  });

  describe('getUserReviews', () => {
    it('should return all reviews by a user (History)', async () => {
      mockReviewModel.find.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.sort.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue([mockReview]);

      const result = await service.getUserReviews('user_123');

      expect(result).toHaveLength(1);
    });
  });

  describe('deleteReview', () => {
  it('should delete review as author', async () => {
    const reviewToDelete = {
      ...mockReview,
      author: 'user_123',
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(reviewToDelete as any);
    jest.spyOn(repository, 'delete').mockResolvedValue(reviewToDelete as any);

    const result = await service.deleteReview('review_123', 'user_123');

    expect(result.deleted).toBe(true);
    expect(result.message).toContain('deleted');
    expect(repository.findById).toHaveBeenCalledWith('review_123');
    expect(repository.delete).toHaveBeenCalledWith({ _id: 'review_123' });
  });

  it('should delete review as admin (even if not author)', async () => {
    const reviewToDelete = {
      ...mockReview,
      author: 'user_123', // Original author
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(reviewToDelete as any);
    jest.spyOn(repository, 'delete').mockResolvedValue(reviewToDelete as any);

    const result = await service.deleteReview('review_123', 'admin_user', 'admin');

    expect(result.deleted).toBe(true);
    expect(result.message).toContain('admin');
    expect(repository.delete).toHaveBeenCalledWith({ _id: 'review_123' });
  });

  it('should throw ForbiddenException if user is not author and not admin', async () => {
    const reviewToDelete = {
      ...mockReview,
      author: 'user_123',
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(reviewToDelete as any);

    await expect(service.deleteReview('review_123', 'unauthorized_user', 'member'))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if review not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(service.deleteReview('ghost_review', 'user_123'))
      .rejects.toThrow(NotFoundException);
  });
});

  describe('toggleLike', () => {
    it('should add like if user has not liked', async () => {
      const dto = { reviewId: 'review_123', userId: 'user_new' };
      const reviewToLike = {
        ...mockReview,
        likes: 0,
        likedBy: [],
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(reviewToLike as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...reviewToLike,
        likes: 1,
        likedBy: ['user_new'],
        _id: 'review_123',
      } as any);
      
      mockReviewModel.findById.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue({
        ...reviewToLike,
        likes: 1,
        likedBy: ['user_new']
      });

      const result = await service.toggleLike(dto);

      expect(result.likes).toBe(1);
    });

    it('should remove like if user already liked', async () => {
      const dto = { reviewId: 'review_123', userId: 'user_existing' };
      const reviewToUnlike = {
        ...mockReview,
        likes: 5,
        likedBy: ['user_existing', 'user_other'],
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(reviewToUnlike as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...reviewToUnlike,
        likes: 4,
        likedBy: ['user_other'],
        _id: 'review_123',
      } as any);

      mockReviewModel.findById.mockReturnThis();
      mockReviewModel.populate.mockReturnThis();
      mockReviewModel.exec.mockResolvedValue({
        ...reviewToUnlike,
        likes: 4,
        likedBy: ['user_other']
      });

      const result = await service.toggleLike(dto);

      expect(result.likes).toBe(4);
    });

    it('should throw NotFoundException if review not found', async () => {
      const dto = { reviewId: 'ghost_review', userId: 'user_123' };
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.toggleLike(dto))
        .rejects.toThrow(NotFoundException);
    });
  });
});
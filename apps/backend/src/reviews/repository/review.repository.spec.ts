import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReviewRepository } from './review.repository';
import { Review, reviewSchema } from '../schema/review.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * ReviewRepository Integration Tests
 * 
 * Tests the repository layer against an in-memory MongoDB instance.
 * 
 * To run: npm test -- apps/backend/src/reviews/repository/review.repository.spec.ts
 */
describe('ReviewRepository - Integration', () => {
  let repository: ReviewRepository;
  let reviewModel: Model<Review>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: Review.name, schema: reviewSchema }]),
      ],
      providers: [ReviewRepository],
    }).compile();

    repository = module.get<ReviewRepository>(ReviewRepository);
    reviewModel = module.get<Model<Review>>(getModelToken(Review.name));
  }, 60000);

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (reviewModel) {
      await reviewModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create() -> should persist a new review', async () => {
    const reviewData = {
      author: 'user_001',
      place: 'place_001',
      rating: 5,
      reviewText: 'Amazing place! Great food and service.',
      date: new Date('2026-01-15'),
    };

    const result = await repository.create(reviewData as any);

    expect(result).toBeDefined();
    expect(result.rating).toBe(5);
    expect(result.reviewText).toContain('Amazing');
    expect(result.likes).toBe(0);
    expect(result.likedBy).toHaveLength(0);
  });

  it('create() -> should create review with optional event', async () => {
    const reviewData = {
      author: 'user_002',
      place: 'place_002',
      event: 'event_001',
      rating: 4,
      reviewText: 'Good experience at the event!',
      date: new Date('2026-01-20'),
    };

    const result = await repository.create(reviewData as any);

    expect(result).toBeDefined();
    expect(result.event).toBeDefined();
  });

  it('findById() -> should retrieve review by ID', async () => {
    const created = await reviewModel.create({
      author: 'user_003',
      place: 'place_003',
      rating: 5,
      reviewText: 'Excellent!',
      date: new Date(),
    });

    const result = await repository.findById(created._id.toString());

    expect(result).toBeDefined();
    expect(result?._id.toString()).toBe(created._id.toString());
  });

  it('findMany() -> should retrieve all reviews', async () => {
    await reviewModel.create({
      author: 'user_004',
      place: 'place_004',
      rating: 5,
      reviewText: 'Great!',
      date: new Date(),
    });
    await reviewModel.create({
      author: 'user_005',
      place: 'place_005',
      rating: 4,
      reviewText: 'Good!',
      date: new Date(),
    });

    const result = await repository.findMany({});

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by place', async () => {
    await reviewModel.create({
      author: 'user_006',
      place: 'place_specific',
      rating: 5,
      reviewText: 'Review 1',
      date: new Date(),
    });
    await reviewModel.create({
      author: 'user_007',
      place: 'place_specific',
      rating: 4,
      reviewText: 'Review 2',
      date: new Date(),
    });
    await reviewModel.create({
      author: 'user_008',
      place: 'place_other',
      rating: 3,
      reviewText: 'Review 3',
      date: new Date(),
    });

    const result = await repository.findMany({ place: 'place_specific' });

    expect(result).toHaveLength(2);
    expect(result[0].place.toString()).toBe('place_specific');
  });

  it('findMany() -> should filter by author (user history)', async () => {
    await reviewModel.create({
      author: 'user_history',
      place: 'place_A',
      rating: 5,
      reviewText: 'Review A',
      date: new Date('2026-01-10'),
    });
    await reviewModel.create({
      author: 'user_history',
      place: 'place_B',
      rating: 4,
      reviewText: 'Review B',
      date: new Date('2026-01-15'),
    });
    await reviewModel.create({
      author: 'user_other',
      place: 'place_C',
      rating: 3,
      reviewText: 'Review C',
      date: new Date(),
    });

    const result = await repository.findMany({ author: 'user_history' });

    expect(result).toHaveLength(2);
    expect(result[0].author.toString()).toBe('user_history');
  });

  it('findMany() -> should filter by event', async () => {
    await reviewModel.create({
      author: 'user_009',
      place: 'place_009',
      event: 'event_specific',
      rating: 5,
      reviewText: 'Event review',
      date: new Date(),
    });
    await reviewModel.create({
      author: 'user_010',
      place: 'place_010',
      rating: 4,
      reviewText: 'No event',
      date: new Date(),
    });

    const result = await repository.findMany({ event: 'event_specific' });

    expect(result).toHaveLength(1);
    expect(result[0].event?.toString()).toBe('event_specific');
  });

  it('save() -> should update review with likes', async () => {
    const review = await reviewModel.create({
      author: 'user_011',
      place: 'place_011',
      rating: 5,
      reviewText: 'To be liked',
      date: new Date(),
      likes: 0,
      likedBy: [],
    });

    review.likes = 5;
    review.likedBy = ['user_A', 'user_B', 'user_C'] as any;

    const result = await repository.save(review);

    expect(result.likes).toBe(5);
    expect(result.likedBy).toHaveLength(3);
  });

  it('delete() -> should remove review', async () => {
    await reviewModel.create({
      author: 'user_012',
      place: 'place_012',
      rating: 5,
      reviewText: 'To be deleted',
      date: new Date(),
    });

    const result = await repository.delete({ author: 'user_012' });

    expect(result).toBeDefined();
    expect(result?.reviewText).toContain('deleted');

    const findAgain = await reviewModel.findOne({ author: 'user_012' });
    expect(findAgain).toBeNull();
  });

  it('findById() -> should return null if review not found', async () => {
    const result = await repository.findById('507f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });

  it('findOne() -> should return null if review not found', async () => {
    const result = await repository.findOne({ author: 'ghost_review' });
    expect(result).toBeNull();
  });

  it('delete() -> should return null if review not found', async () => {
    const result = await repository.delete({ author: 'nonexistent' });
    expect(result).toBeNull();
  });
});
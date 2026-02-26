import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadgeRepository } from './badge.repository';
import { Badge, badgeSchema } from '../schemas/badges.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * BadgeRepository Integration Tests
 * 
 * To run: npm test -- apps/backend/src/badges/repository/badge.repository.spec.ts
 */
describe('BadgeRepository - Integration', () => {
  let repository: BadgeRepository;
  let badgeModel: Model<Badge>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: Badge.name, schema: badgeSchema }]),
      ],
      providers: [BadgeRepository],
    }).compile();

    repository = module.get<BadgeRepository>(BadgeRepository);
    badgeModel = module.get<Model<Badge>>(getModelToken(Badge.name));
  }, 60000);

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (badgeModel) {
      await badgeModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create() -> should persist a new badge', async () => {
    const badgeData = {
      badgeId: 'trendsetter',
      name: 'The Trendsetter',
      description: 'Have 10 people join an event you created',
      category: 'Social & Community',
      iconUrl: '',
    };

    const result = await repository.create(badgeData as any);

    expect(result).toBeDefined();
    expect(result.badgeId).toBe('trendsetter');
    expect(result.name).toBe('The Trendsetter');
    expect(result.totalAwarded).toBe(0);
  });

  it('create() -> should create badge with tier', async () => {
    const badgeData = {
      badgeId: 'regular-bronze',
      name: 'The Regular',
      description: 'Hit your 10th total outing',
      category: 'Streaks & Consistency',
      tier: 'Bronze',
      iconUrl: '',
    };

    const result = await repository.create(badgeData as any);

    expect(result).toBeDefined();
    expect(result.tier).toBe('Bronze');
  });

  it('findByBadgeId() -> should retrieve badge by badgeId', async () => {
    await badgeModel.create({
      badgeId: 'social-butterfly',
      name: 'Social Butterfly',
      description: 'Attend 3 outings',
      category: 'Social & Community',
      iconUrl: '',
    });

    const result = await repository.findByBadgeId('social-butterfly');

    expect(result).toBeDefined();
    expect(result?.name).toBe('Social Butterfly');
  });

  it('findById() -> should retrieve badge by MongoDB _id', async () => {
    const created = await badgeModel.create({
      badgeId: 'paparazzi',
      name: 'Paparazzi',
      description: 'Upload a photo with 10 different reviews',
      category: 'Contribution',
      iconUrl: '',
    });

    const result = await repository.findById(created._id.toString());

    expect(result).toBeDefined();
    expect(result?.badgeId).toBe('paparazzi');
  });

  it('findAll() -> should retrieve all badges', async () => {
    await badgeModel.create({
      badgeId: 'badge-1',
      name: 'Badge 1',
      description: 'Description 1',
      category: 'Category A',
      iconUrl: '',
    });
    await badgeModel.create({
      badgeId: 'badge-2',
      name: 'Badge 2',
      description: 'Description 2',
      category: 'Category B',
      iconUrl: '',
    });

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by category', async () => {
    await badgeModel.create({
      badgeId: 'badge-social-1',
      name: 'Social Badge 1',
      description: 'Desc',
      category: 'Social & Community',
      iconUrl: '',
    });
    await badgeModel.create({
      badgeId: 'badge-social-2',
      name: 'Social Badge 2',
      description: 'Desc',
      category: 'Social & Community',
      iconUrl: '',
    });
    await badgeModel.create({
      badgeId: 'badge-exploration',
      name: 'Exploration Badge',
      description: 'Desc',
      category: 'Exploration & Discovery',
      iconUrl: '',
    });

    const result = await repository.findMany({ category: 'Social & Community' });

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by tier', async () => {
    await badgeModel.create({
      badgeId: 'regular-bronze',
      name: 'The Regular',
      description: '10th outing',
      category: 'Streaks & Consistency',
      tier: 'Bronze',
      iconUrl: '',
    });
    await badgeModel.create({
      badgeId: 'regular-silver',
      name: 'The Regular',
      description: '50th outing',
      category: 'Streaks & Consistency',
      tier: 'Silver',
      iconUrl: '',
    });

    const result = await repository.findMany({ tier: 'Bronze' });

    expect(result).toHaveLength(1);
    expect(result[0].tier).toBe('Bronze');
  });

  it('update() -> should update badge data', async () => {
    await badgeModel.create({
      badgeId: 'test-badge',
      name: 'Old Name',
      description: 'Old description',
      category: 'Category',
      iconUrl: '',
    });

    const result = await repository.update(
      { badgeId: 'test-badge' },
      { $set: { name: 'New Name', iconUrl: 'https://firebase.storage/badge.png' } }
    );

    expect(result).toBeDefined();
    expect(result?.name).toBe('New Name');
    expect(result?.iconUrl).toBe('https://firebase.storage/badge.png');
  });

  it('incrementTotalAwarded() -> should increment counter', async () => {
    await badgeModel.create({
      badgeId: 'award-test',
      name: 'Award Test',
      description: 'Test',
      category: 'Test',
      iconUrl: '',
      totalAwarded: 5,
    });

    await repository.incrementTotalAwarded('award-test');

    const result = await badgeModel.findOne({ badgeId: 'award-test' });
    expect(result?.totalAwarded).toBe(6);
  });

  it('delete() -> should remove badge', async () => {
    await badgeModel.create({
      badgeId: 'to-delete',
      name: 'To Be Deleted',
      description: 'Desc',
      category: 'Category',
      iconUrl: '',
    });

    const result = await repository.delete({ badgeId: 'to-delete' });

    expect(result).toBeDefined();
    expect(result?.name).toBe('To Be Deleted');

    const findAgain = await badgeModel.findOne({ badgeId: 'to-delete' });
    expect(findAgain).toBeNull();
  });

  it('findByBadgeId() -> should return null if badge not found', async () => {
    const result = await repository.findByBadgeId('ghost-badge');
    expect(result).toBeNull();
  });

  it('findById() -> should return null if badge not found', async () => {
    const result = await repository.findById('507f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });

  it('delete() -> should return null if badge not found', async () => {
    const result = await repository.delete({ badgeId: 'nonexistent' });
    expect(result).toBeNull();
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaceRepository } from './place.repository';
import { Place, placeSchema } from '../schemas/place.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * PlaceRepository Integration Tests
 * 
 * Tests the repository layer against an in-memory MongoDB instance.
 * 
 * To run: npm test -- apps/backend/src/places/repository/place.repository.spec.ts
 */
describe('PlaceRepository - Integration', () => {
  let repository: PlaceRepository;
  let placeModel: Model<Place>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: Place.name, schema: placeSchema }]),
      ],
      providers: [PlaceRepository],
    }).compile();

    repository = module.get<PlaceRepository>(PlaceRepository);
    placeModel = module.get<Model<Place>>(getModelToken(Place.name));
  }, 60000); // 60 second timeout for MongoDB download

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (placeModel) {
      await placeModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create() -> should persist a new place', async () => {
    const placeData = {
      googlePlaceId: 'ChIJ_test_001',
      name: 'Test Restaurant',
      address: '123 Test St',
      category: 'Restaurant',
    };

    const result = await repository.create(placeData);

    expect(result).toBeDefined();
    expect(result.googlePlaceId).toBe('ChIJ_test_001');
    expect(result.name).toBe('Test Restaurant');

    // Verify persistence
    const dbPlace = await placeModel.findOne({ googlePlaceId: 'ChIJ_test_001' });
    expect(dbPlace).toBeDefined();
  });

  it('findOne() -> should retrieve place by googlePlaceId', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_002',
      name: 'Pizzaria Bella',
      address: 'Rua Augusta, 123',
      category: 'Restaurant',
    });

    const result = await repository.findOne({ googlePlaceId: 'ChIJ_test_002' });

    expect(result).toBeDefined();
    expect(result?.name).toBe('Pizzaria Bella');
  });

  it('findOne() -> should retrieve place by _id', async () => {
    const created = await placeModel.create({
      googlePlaceId: 'ChIJ_test_003',
      name: 'Cafe Central',
      address: 'Av Paulista, 456',
      category: 'Cafe',
    });

    const result = await repository.findOne({ _id: created._id.toString() });

    expect(result).toBeDefined();
    expect(result?.name).toBe('Cafe Central');
  });

  it('findMany() -> should retrieve all places', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_004',
      name: 'Restaurant A',
      address: 'Address A',
      category: 'Restaurant',
    });
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_005',
      name: 'Restaurant B',
      address: 'Address B',
      category: 'Restaurant',
    });

    const result = await repository.findMany({});

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by category', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_006',
      name: 'Restaurant',
      address: 'Address',
      category: 'Restaurant',
    });
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_007',
      name: 'Park',
      address: 'Address',
      category: 'Park',
    });

    const result = await repository.findMany({ category: 'Park' });

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Park');
  });

  it('update() -> should update place data', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_008',
      name: 'Old Name',
      address: 'Address',
      category: 'Restaurant',
      description: '',
    });

    const result = await repository.update(
      { googlePlaceId: 'ChIJ_test_008' },
      { $set: { description: 'New description' } }
    );

    expect(result).toBeDefined();
    expect(result?.description).toBe('New description');
  });

  it('update() -> should update custom images', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_009',
      name: 'Place with Images',
      address: 'Address',
      category: 'Restaurant',
      customImages: [],
    });

    const result = await repository.update(
      { googlePlaceId: 'ChIJ_test_009' },
      { $set: { customImages: ['https://image1.jpg', 'https://image2.jpg'] } }
    );

    expect(result).toBeDefined();
    expect(result?.customImages).toHaveLength(2);
  });

  it('update() -> should update rating and review count', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_010',
      name: 'Rated Place',
      address: 'Address',
      category: 'Restaurant',
      averageUserRating: 0,
      totalUserReviews: 0,
    });

    const result = await repository.update(
      { googlePlaceId: 'ChIJ_test_010' },
      { $set: { averageUserRating: 4.5, totalUserReviews: 10 } }
    );

    expect(result).toBeDefined();
    expect(result?.averageUserRating).toBe(4.5);
    expect(result?.totalUserReviews).toBe(10);
  });

  it('delete() -> should remove place', async () => {
    await placeModel.create({
      googlePlaceId: 'ChIJ_test_011',
      name: 'To Be Deleted',
      address: 'Address',
      category: 'Restaurant',
    });

    const result = await repository.delete({ googlePlaceId: 'ChIJ_test_011' });

    expect(result).toBeDefined();
    expect(result?.name).toBe('To Be Deleted');

    // Verify deletion
    const findAgain = await placeModel.findOne({ googlePlaceId: 'ChIJ_test_011' });
    expect(findAgain).toBeNull();
  });

  it('findOne() -> should return null if place not found', async () => {
    const result = await repository.findOne({ googlePlaceId: 'ghost_place' });
    expect(result).toBeNull();
  });

  it('update() -> should return null if place not found', async () => {
    const result = await repository.update(
      { googlePlaceId: 'nonexistent' },
      { $set: { description: 'test' } }
    );
    expect(result).toBeNull();
  });

  it('delete() -> should return null if place not found', async () => {
    const result = await repository.delete({ googlePlaceId: 'nonexistent' });
    expect(result).toBeNull();
  });
});
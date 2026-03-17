import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProfileRepository } from './profile.repository';
import { User, userSchema } from '../../user/schemas/user.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('ProfileRepository - Integration', () => {
  let repository: ProfileRepository;
  let userModel: Model<User>;
  let mongod: MongoMemoryServer;

  // ← AUMENTAR TIMEOUT PARA 60 SEGUNDOS
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
      ],
      providers: [ProfileRepository],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  }, 60000); // ← TIMEOUT DE 60 SEGUNDOS

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (userModel) {
      await userModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('findOne() -> should retrieve user by firebaseUid', async () => {
    await userModel.create({ 
      firebaseUid: 'profile_test_001', 
      username: 'profileuser',
      email: 'profile@test.com',
      profile: {
        preferences: { cuisine: 'Italian' },
        privacy: { activityFeed: 'Friends' }
      }
    });

    const result = await repository.findOne({ firebaseUid: 'profile_test_001' });
    
    expect(result).toBeDefined();
    expect(result?.username).toBe('profileuser');
    expect(result?.profile?.preferences?.cuisine).toBe('Italian');
  });

  it('findOne() -> should retrieve user by username', async () => {
    await userModel.create({ 
      firebaseUid: 'profile_test_002', 
      username: 'searchme',
      email: 'search@test.com'
    });

    const result = await repository.findOne({ username: 'searchme' });
    
    expect(result).toBeDefined();
    expect(result?.firebaseUid).toBe('profile_test_002');
  });

  it('update() -> should update profile preferences', async () => {
    await userModel.create({ 
      firebaseUid: 'profile_test_003', 
      username: 'updateme',
      email: 'update@test.com',
      profile: {
        preferences: { cuisine: '' },
        privacy: { activityFeed: 'Friends' }
      }
    });

    const result = await repository.update(
      { firebaseUid: 'profile_test_003' },
      { $set: { 'profile.preferences.cuisine': 'Japanese' } }
    );

    expect(result).toBeDefined();
    expect(result?.profile?.preferences?.cuisine).toBe('Japanese');
  });

  it('update() -> should update profile privacy settings', async () => {
    await userModel.create({ 
      firebaseUid: 'profile_test_004', 
      username: 'privacytest',
      email: 'privacy@test.com',
      profile: {
        preferences: {},
        privacy: { activityFeed: 'Friends' }
      }
    });

    const result = await repository.update(
      { firebaseUid: 'profile_test_004' },
      { $set: { 'profile.privacy.activityFeed': 'None' } }
    );

    expect(result).toBeDefined();
    expect(result?.profile?.privacy?.activityFeed).toBe('None');
  });

  it('update() -> should update multiple fields at once', async () => {
    await userModel.create({ 
      firebaseUid: 'profile_test_005', 
      username: 'multiupdate',
      email: 'multi@test.com',
      profile: {
        preferences: { cuisine: '', allergies: '' },
        privacy: { favorites: 'Friends' }
      }
    });

    const result = await repository.update(
      { firebaseUid: 'profile_test_005' },
      { 
        $set: { 
          'profile.preferences.cuisine': 'Mexican',
          'profile.preferences.allergies': 'Peanuts',
          'profile.privacy.favorites': 'None'
        } 
      }
    );

    expect(result).toBeDefined();
    expect(result?.profile?.preferences?.cuisine).toBe('Mexican');
    expect(result?.profile?.preferences?.allergies).toBe('Peanuts');
    expect(result?.profile?.privacy?.favorites).toBe('None');
  });

  it('findOne() -> should return null if user not found', async () => {
    const result = await repository.findOne({ firebaseUid: 'ghost_profile' });
    expect(result).toBeNull();
  });

  it('update() -> should return null if user not found', async () => {
    const result = await repository.update(
      { firebaseUid: 'nonexistent' },
      { $set: { 'profile.preferences.cuisine': 'French' } }
    );
    expect(result).toBeNull();
  });
});
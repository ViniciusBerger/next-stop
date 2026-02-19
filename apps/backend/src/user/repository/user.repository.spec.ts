import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from './user.repository';
import { User, userSchema } from '../user.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('UserRepository - Full CRUD Integration', () => {
  let repository: UserRepository;
  let userModel: Model<User>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create(); // create in memory database server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
      ],
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(async () => {
    await userModel.deleteMany({}); // clean in-memory database in between sets; sanity clean-up
  });

  it('create() -> should persist a new user and apply schema defaults', async () => {
    const data = { firebaseUid: 'auth_1', username: 'new_user' };
    const result = await repository.create(data);

    // Check return value AND database persistence
    expect(result.firebaseUid).toBe('auth_1');
    const dbUser = await userModel.findOne({ firebaseUid: 'auth_1' });
    expect(dbUser).toBeDefined();
    expect(dbUser?.role).toBe('member'); // Verifies schema default was applied
  });

  it('findOne() -> should retrieve a document by any field in IuserData', async () => {
    await userModel.create({ firebaseUid: 'auth_2', username: 'search_me' });

    // Test generic search capability
    const result = await repository.findOne({ username: 'search_me' });
    expect(result?.firebaseUid).toBe('auth_2');
  });

  it('delete() -> should remove the document and return the deleted object', async () => {
    await userModel.create({ firebaseUid: 'auth_3', username: 'to_be_deleted' });

    // Act
    const deleted = await repository.delete({ firebaseUid: 'auth_3' });
    
    // Assert: Document is returned but no longer exists in DB
    expect(deleted?.username).toBe('to_be_deleted');
    const findAgain = await userModel.findOne({ firebaseUid: 'auth_3' });
    expect(findAgain).toBeNull();
  });

  it('Edge Case -> should return null if filter matches nothing', async () => {
    const result = await repository.findOne({ firebaseUid: 'ghost' });
    expect(result).toBeNull();
  });
});
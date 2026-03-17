import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from './event.repository';
import { Event, eventSchema, EventPrivacy, EventStatus } from '../schema/event.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * EventRepository Integration Tests
 * 
 * To run: npm test -- apps/backend/src/events/repository/event.repository.spec.ts
 */
describe('EventRepository - Integration', () => {
  let repository: EventRepository;
  let eventModel: Model<Event>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: Event.name, schema: eventSchema }]),
      ],
      providers: [EventRepository],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  }, 60000);

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (eventModel) {
      await eventModel.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create() -> should persist a new event', async () => {
    const eventData = {
      name: 'Pizza Night',
      description: 'Join us for pizza!',
      date: new Date('2026-03-15'),
      location: 'Main dining area',
      place: 'place_001',
      privacy: EventPrivacy.PUBLIC,
      host: 'user_001',
    };

    const result = await repository.create(eventData as any);

    expect(result).toBeDefined();
    expect(result.name).toBe('Pizza Night');
    expect(result.privacy).toBe(EventPrivacy.PUBLIC);
    expect(result.attendees).toHaveLength(0);
  });

  it('findById() -> should retrieve event by ID', async () => {
    const created = await eventModel.create({
      name: 'Brunch Event',
      description: 'Weekend brunch',
      date: new Date('2026-04-01'),
      location: 'Garden patio',
      place: 'place_002',
      privacy: EventPrivacy.PRIVATE,
      host: 'user_002',
    });

    const result = await repository.findById(created._id.toString());

    expect(result).toBeDefined();
    expect(result?.name).toBe('Brunch Event');
  });

  it('findMany() -> should retrieve all events', async () => {
    await eventModel.create({
      name: 'Event A',
      description: 'Description A',
      date: new Date('2026-05-01'),
      location: 'Location A',
      place: 'place_A',
      host: 'user_A',
    });
    await eventModel.create({
      name: 'Event B',
      description: 'Description B',
      date: new Date('2026-05-02'),
      location: 'Location B',
      place: 'place_B',
      host: 'user_B',
    });

    const result = await repository.findMany({});

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by host', async () => {
    await eventModel.create({
      name: 'Host Event 1',
      description: 'Desc',
      date: new Date('2026-06-01'),
      location: 'Loc',
      place: 'place_1',
      host: 'host_specific',
    });
    await eventModel.create({
      name: 'Host Event 2',
      description: 'Desc',
      date: new Date('2026-06-02'),
      location: 'Loc',
      place: 'place_2',
      host: 'host_specific',
    });
    await eventModel.create({
      name: 'Other Event',
      description: 'Desc',
      date: new Date('2026-06-03'),
      location: 'Loc',
      place: 'place_3',
      host: 'host_other',
    });

    const result = await repository.findMany({ host: 'host_specific' });

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by place', async () => {
    await eventModel.create({
      name: 'Event at Place X',
      description: 'Desc',
      date: new Date('2026-07-01'),
      location: 'Loc',
      place: 'place_X',
      host: 'user_1',
    });
    await eventModel.create({
      name: 'Another Event at Place X',
      description: 'Desc',
      date: new Date('2026-07-02'),
      location: 'Loc',
      place: 'place_X',
      host: 'user_2',
    });

    const result = await repository.findMany({ place: 'place_X' });

    expect(result).toHaveLength(2);
  });

  it('findMany() -> should filter by status', async () => {
    await eventModel.create({
      name: 'Upcoming Event',
      description: 'Desc',
      date: new Date('2026-08-01'),
      location: 'Loc',
      place: 'place_1',
      host: 'user_1',
      status: EventStatus.UPCOMING,
    });
    await eventModel.create({
      name: 'Past Event',
      description: 'Desc',
      date: new Date('2025-01-01'),
      location: 'Loc',
      place: 'place_2',
      host: 'user_2',
      status: EventStatus.PAST,
    });

    const result = await repository.findMany({ status: EventStatus.UPCOMING });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(EventStatus.UPCOMING);
  });

  it('update() -> should update event data', async () => {
    await eventModel.create({
      name: 'Old Name',
      description: 'Old desc',
      date: new Date('2026-09-01'),
      location: 'Old loc',
      place: 'place_1',
      host: 'user_1',
    });

    const result = await repository.update(
      { host: 'user_1' },
      { $set: { name: 'New Name', description: 'New desc' } }
    );

    expect(result).toBeDefined();
    expect(result?.name).toBe('New Name');
    expect(result?.description).toBe('New desc');
  });

  it('save() -> should update attendees array', async () => {
    const event = await eventModel.create({
      name: 'Event with Attendees',
      description: 'Desc',
      date: new Date('2026-10-01'),
      location: 'Loc',
      place: 'place_1',
      host: 'user_1',
      attendees: [],
    });

    event.attendees = ['user_A', 'user_B', 'user_C'] as any;

    const result = await repository.save(event);

    expect(result.attendees).toHaveLength(3);
  });

  it('delete() -> should remove event', async () => {
    await eventModel.create({
      name: 'To Be Deleted',
      description: 'Desc',
      date: new Date('2026-11-01'),
      location: 'Loc',
      place: 'place_1',
      host: 'user_1',
    });

    const result = await repository.delete({ host: 'user_1' });

    expect(result).toBeDefined();
    expect(result?.name).toBe('To Be Deleted');

    const findAgain = await eventModel.findOne({ host: 'user_1' });
    expect(findAgain).toBeNull();
  });

  it('findOne() -> should return null if event not found', async () => {
    const result = await repository.findOne({ host: 'ghost_user' });
    expect(result).toBeNull();
  });

  it('delete() -> should return null if event not found', async () => {
    const result = await repository.delete({ host: 'nonexistent' });
    expect(result).toBeNull();
  });
});
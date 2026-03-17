import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from '../service/event.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

/**
 * EventController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/events/controller/event.controller.spec.ts
 */
describe('EventController - Unit Test', () => {
  let controller: EventController;
  let service: EventService;

  const mockEvent = {
    _id: 'event_123',
    name: 'Pizza Night',
    description: 'Join us for pizza!',
    date: new Date('2026-03-15'),
    location: 'Main dining area',
    place: 'place_123',
    privacy: 'Public Event',
    host: 'user_123',
    attendees: [],
    invitedFriends: [],
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function() { return this; }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            createEvent: jest.fn(),
            getAllEvents: jest.fn(),
            getEvent: jest.fn(),
            getUserEvents: jest.fn(),
            updateEvent: jest.fn(),
            deleteEvent: jest.fn(),
            toggleAttendance: jest.fn(),
            inviteFriends: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createDto = {
        name: 'New Event',
        description: 'Description',
        date: '2026-04-01',
        location: 'Location',
        place: 'place_new',
        privacy: 'Public Event',
        host: 'user_new',
      } as any;

      jest.spyOn(service, 'createEvent').mockResolvedValue(mockEvent as any);

      const result = await controller.createEvent(createDto);

      expect(result).toBeDefined();
      expect(service.createEvent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      jest.spyOn(service, 'getAllEvents').mockResolvedValue([mockEvent] as any);

      const result = await controller.getEvents();

      expect(result).toHaveLength(1);
      expect(service.getAllEvents).toHaveBeenCalled();
    });

    it('should filter events by host', async () => {
      const dto = { host: 'user_specific' } as any;
      jest.spyOn(service, 'getAllEvents').mockResolvedValue([mockEvent] as any);

      const result = await controller.getEvents(dto);

      expect(result).toBeDefined();
      expect(service.getAllEvents).toHaveBeenCalledWith(dto);
    });
  });

  describe('getEvent', () => {
    it('should return event by id', async () => {
      jest.spyOn(service, 'getEvent').mockResolvedValue(mockEvent as any);

      const result = await controller.getEvent('event_123');

      expect(result).toBeDefined();
      expect(service.getEvent).toHaveBeenCalledWith('event_123', undefined);
    });

    it('should return event with userId for access control', async () => {
      jest.spyOn(service, 'getEvent').mockResolvedValue(mockEvent as any);

      const result = await controller.getEvent('event_123', 'user_123');

      expect(result).toBeDefined();
      expect(service.getEvent).toHaveBeenCalledWith('event_123', 'user_123');
    });
  });

  describe('getUserEvents', () => {
    it('should return created and attending events', async () => {
      const mockUserEvents = {
        created: [mockEvent],
        attending: [mockEvent],
      };

      jest.spyOn(service, 'getUserEvents').mockResolvedValue(mockUserEvents as any);

      const result = await controller.getUserEvents('user_123');

      expect(result.created).toHaveLength(1);
      expect(result.attending).toHaveLength(1);
      expect(service.getUserEvents).toHaveBeenCalledWith('user_123');
    });
  });

  describe('updateEvent', () => {
    it('should update event', async () => {
      const updateDto = { name: 'Updated Event' } as any;

      jest.spyOn(service, 'updateEvent').mockResolvedValue(mockEvent as any);

      const result = await controller.updateEvent('event_123', updateDto, 'user_123');

      expect(result).toBeDefined();
      expect(service.updateEvent).toHaveBeenCalledWith('event_123', 'user_123', updateDto);
    });

    it('should throw BadRequestException if userId not provided', async () => {
      const updateDto = { name: 'Updated' } as any;

      await expect(controller.updateEvent('event_123', updateDto, ''))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteEvent', () => {
    it('should delete event', async () => {
      const deleteResult = { deleted: true, message: 'Event deleted' };

      jest.spyOn(service, 'deleteEvent').mockResolvedValue(deleteResult);

      const result = await controller.deleteEvent('event_123', 'user_123');

      expect(result.deleted).toBe(true);
      expect(service.deleteEvent).toHaveBeenCalledWith('event_123', 'user_123');
    });

    it('should throw BadRequestException if userId not provided', async () => {
      await expect(controller.deleteEvent('event_123', ''))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleAttendance', () => {
    it('should toggle attendance', async () => {
      jest.spyOn(service, 'toggleAttendance').mockResolvedValue(mockEvent as any);

      const result = await controller.toggleAttendance('event_123', { userId: 'user_new' });

      expect(result).toBeDefined();
      expect(service.toggleAttendance).toHaveBeenCalledWith({
        eventId: 'event_123',
        userId: 'user_new',
      });
    });
  });

  describe('inviteFriends', () => {
    it('should invite friends to event', async () => {
      jest.spyOn(service, 'inviteFriends').mockResolvedValue(mockEvent as any);

      const result = await controller.inviteFriends(
        'event_123',
        { friendIds: ['friend_1', 'friend_2'] },
        'user_123'
      );

      expect(result).toBeDefined();
      expect(service.inviteFriends).toHaveBeenCalledWith(
        { eventId: 'event_123', friendIds: ['friend_1', 'friend_2'] },
        'user_123'
      );
    });

    it('should throw BadRequestException if userId not provided', async () => {
      await expect(
        controller.inviteFriends('event_123', { friendIds: ['friend_1'] }, '')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
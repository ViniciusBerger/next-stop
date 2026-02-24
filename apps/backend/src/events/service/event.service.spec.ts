import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from '../repository/event.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Event, EventPrivacy, EventStatus } from '../schema/event.schema';

/**
 * EventService Unit Tests
 * 
 * To run: npm test -- apps/backend/src/events/service/event.service.spec.ts
 */
describe('EventService - Unit Test', () => {
  let service: EventService;
  let repository: EventRepository;

  const mockEvent = {
    _id: 'event_123',
    name: 'Pizza Night',
    description: 'Join us for pizza!',
    date: new Date('2026-03-15'),
    location: 'Main dining area',
    place: 'place_123',
    privacy: EventPrivacy.PUBLIC,
    host: 'user_123',
    attendees: [],
    invitedFriends: [],
    status: EventStatus.UPCOMING,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function() { return this; },
    toString: function() { return this._id; }
  };

  // Mock do EventModel
  const mockEventModel = {
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
        EventService,
        {
          provide: EventRepository,
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
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get<EventRepository>(EventRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createDto = {
        name: 'New Event',
        description: 'Description',
        date: '2026-04-01',
        location: 'Location',
        place: 'place_new',
        privacy: EventPrivacy.PUBLIC,
        host: 'user_new',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockEvent as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue(mockEvent);

      const result = await service.createEvent(createDto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getAllEvents', () => {
    it('should return all events when no filter provided', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockEvent] as any);
      mockEventModel.find.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.sort.mockReturnThis();
      mockEventModel.exec.mockResolvedValue([mockEvent]);

      const result = await service.getAllEvents();

      expect(result).toHaveLength(1);
      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it('should filter by host', async () => {
      const dto = { host: 'user_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockEvent] as any);
      mockEventModel.find.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.sort.mockReturnThis();
      mockEventModel.exec.mockResolvedValue([mockEvent]);

      await service.getAllEvents(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ host: 'user_specific' });
    });

    it('should filter by place', async () => {
      const dto = { place: 'place_specific' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockEvent] as any);
      mockEventModel.find.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.sort.mockReturnThis();
      mockEventModel.exec.mockResolvedValue([mockEvent]);

      await service.getAllEvents(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ place: 'place_specific' });
    });

    it('should filter by status', async () => {
      const dto = { status: EventStatus.UPCOMING };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockEvent] as any);
      mockEventModel.find.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.sort.mockReturnThis();
      mockEventModel.exec.mockResolvedValue([mockEvent]);

      await service.getAllEvents(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ status: EventStatus.UPCOMING });
    });
  });

  describe('getEvent', () => {
    it('should return public event without userId', async () => {
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue(mockEvent);

      const result = await service.getEvent('event_123');

      expect(result).toEqual(mockEvent);
    });

    it('should return private event to host', async () => {
      const privateEvent = { ...mockEvent, privacy: EventPrivacy.PRIVATE };
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue(privateEvent);

      const result = await service.getEvent('event_123', 'user_123');

      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException for private event if user not invited', async () => {
      const privateEvent = { ...mockEvent, privacy: EventPrivacy.PRIVATE };
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue(privateEvent);

      await expect(service.getEvent('event_123', 'unauthorized_user'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue(null);

      await expect(service.getEvent('ghost_event'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserEvents', () => {
    it('should return created and attending events', async () => {
      mockEventModel.find.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.sort.mockReturnThis();
      mockEventModel.exec
        .mockResolvedValueOnce([mockEvent])  // created
        .mockResolvedValueOnce([mockEvent]); // attending

      const result = await service.getUserEvents('user_123');

      expect(result.created).toHaveLength(1);
      expect(result.attending).toHaveLength(1);
    });
  });

  describe('updateEvent', () => {
    it('should update event by host', async () => {
      const updateDto = { name: 'Updated Name' };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent as any);
      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockEvent,
        name: 'Updated Name'
      } as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue({ ...mockEvent, name: 'Updated Name' });

      const result = await service.updateEvent('event_123', 'user_123', updateDto);

      expect(result.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException if non-host tries to update', async () => {
      const updateDto = { name: 'Hacked Name' };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent as any);

      await expect(service.updateEvent('event_123', 'unauthorized_user', updateDto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event not found', async () => {
      const updateDto = { name: 'Name' };

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updateEvent('ghost_event', 'user_123', updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvent', () => {
    it('should delete event by host', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent as any);
      jest.spyOn(repository, 'delete').mockResolvedValue(mockEvent as any);

      const result = await service.deleteEvent('event_123', 'user_123');

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('Pizza Night');
    });

    it('should throw ForbiddenException if non-host tries to delete', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent as any);

      await expect(service.deleteEvent('event_123', 'unauthorized_user'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.deleteEvent('ghost_event', 'user_123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleAttendance', () => {
    it('should add attendee if not already attending', async () => {
      const dto = { eventId: 'event_123', userId: 'user_new' };
      const eventToAttend = { ...mockEvent, attendees: [] };

      jest.spyOn(repository, 'findById').mockResolvedValue(eventToAttend as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...eventToAttend,
        attendees: ['user_new']
      } as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue({ ...eventToAttend, attendees: ['user_new'] });

      const result = await service.toggleAttendance(dto);

      expect(result.attendees).toContain('user_new');
    });

    it('should remove attendee if already attending', async () => {
      const dto = { eventId: 'event_123', userId: 'user_existing' };
      const eventToLeave = { ...mockEvent, attendees: ['user_existing', 'user_other'] };

      jest.spyOn(repository, 'findById').mockResolvedValue(eventToLeave as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...eventToLeave,
        attendees: ['user_other']
      } as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue({ ...eventToLeave, attendees: ['user_other'] });

      const result = await service.toggleAttendance(dto);

      expect(result.attendees).not.toContain('user_existing');
    });

    it('should throw BadRequestException for past events', async () => {
      const dto = { eventId: 'event_123', userId: 'user_new' };
      const pastEvent = { ...mockEvent, status: EventStatus.PAST };

      jest.spyOn(repository, 'findById').mockResolvedValue(pastEvent as any);

      await expect(service.toggleAttendance(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for cancelled events', async () => {
      const dto = { eventId: 'event_123', userId: 'user_new' };
      const cancelledEvent = { ...mockEvent, status: EventStatus.CANCELLED };

      jest.spyOn(repository, 'findById').mockResolvedValue(cancelledEvent as any);

      await expect(service.toggleAttendance(dto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for private event if not invited', async () => {
      const dto = { eventId: 'event_123', userId: 'uninvited_user' };
      const privateEvent = { 
        ...mockEvent, 
        privacy: EventPrivacy.PRIVATE,
        attendees: [],
        invitedFriends: []
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(privateEvent as any);

      await expect(service.toggleAttendance(dto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event not found', async () => {
      const dto = { eventId: 'ghost_event', userId: 'user_123' };

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.toggleAttendance(dto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('inviteFriends', () => {
    it('should invite friends by host', async () => {
      const dto = { eventId: 'event_123', friendIds: ['friend_1', 'friend_2'] };
      const eventToInvite = { ...mockEvent, invitedFriends: [] };

      jest.spyOn(repository, 'findById').mockResolvedValue(eventToInvite as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...eventToInvite,
        invitedFriends: ['friend_1', 'friend_2']
      } as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue({
        ...eventToInvite,
        invitedFriends: ['friend_1', 'friend_2']
      });

      const result = await service.inviteFriends(dto, 'user_123');

      expect(result.invitedFriends).toHaveLength(2);
    });

    it('should not add duplicate invites', async () => {
      const dto = { eventId: 'event_123', friendIds: ['friend_1', 'friend_2'] };
      const eventWithInvites = { 
        ...mockEvent, 
        invitedFriends: ['friend_1'] 
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(eventWithInvites as any);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...eventWithInvites,
        invitedFriends: ['friend_1', 'friend_2']
      } as any);
      mockEventModel.findById.mockReturnThis();
      mockEventModel.populate.mockReturnThis();
      mockEventModel.exec.mockResolvedValue({
        ...eventWithInvites,
        invitedFriends: ['friend_1', 'friend_2']
      });

      const result = await service.inviteFriends(dto, 'user_123');

      expect(result.invitedFriends).toHaveLength(2);
    });

    it('should throw ForbiddenException if non-host tries to invite', async () => {
      const dto = { eventId: 'event_123', friendIds: ['friend_1'] };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent as any);

      await expect(service.inviteFriends(dto, 'unauthorized_user'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event not found', async () => {
      const dto = { eventId: 'ghost_event', friendIds: ['friend_1'] };

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.inviteFriends(dto, 'user_123'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
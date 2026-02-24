import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from '../repository/event.repository';
import { Event, EventPrivacy } from '../schema/event.schema';
import { CreateEventDTO } from '../DTOs/create.event.DTO';
import { UpdateEventDTO } from '../DTOs/update.event.DTO';
import { GetEventDTO } from '../DTOs/get.event.DTO';
import { AttendEventDTO } from '../DTOs/attend.event.DTO';
import { InviteEventDTO } from '../DTOs/invite.event.DTO';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  /**
   * Creates a new event
   */
  async createEvent(dto: CreateEventDTO): Promise<Event> {
    const newEvent = await this.eventRepository.create(dto as any);

    // Populate before returning
    return await this.eventModel
      .findById(newEvent._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .exec() as Event;
  }

  /**
   * Retrieves all events with optional filters
   */
  async getAllEvents(dto?: GetEventDTO): Promise<Event[]> {
    const filter: any = {};

    if (dto) {
      if (dto.host) filter.host = dto.host;
      if (dto.place) filter.place = dto.place;
      if (dto.status) filter.status = dto.status;
    }

    const events = await this.eventRepository.findMany(filter);

    return await this.eventModel
      .find({ _id: { $in: events.map(e => e._id) } })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Retrieves a specific event with access control
   */
  async getEvent(eventId: string, userId?: string): Promise<Event> {
    const event = await this.eventModel
      .findById(eventId)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Access control for private events
    if (event.privacy === EventPrivacy.PRIVATE && userId) {
      const isHost = event.host.toString() === userId.toString();
      const isAttendee = event.attendees.some(id => id.toString() === userId.toString());
      const isInvited = event.invitedFriends.some(id => id.toString() === userId.toString());

      if (!isHost && !isAttendee && !isInvited) {
        throw new ForbiddenException('You do not have access to this private event');
      }
    }

    return event;
  }

  /**
   * Retrieves events created by or attended by user
   */
  async getUserEvents(userId: string): Promise<{ created: Event[]; attending: Event[] }> {
    const createdEvents = await this.eventModel
      .find({ host: userId })
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .sort({ date: 1 })
      .exec();

    const attendingEvents = await this.eventModel
      .find({ attendees: userId })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .sort({ date: 1 })
      .exec();

    return {
      created: createdEvents,
      attending: attendingEvents,
    };
  }

  /**
   * Updates an event (host only)
   */
  async updateEvent(
    eventId: string,
    userId: string,
    updateDto: UpdateEventDTO,
  ): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can update
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can update this event');
    }

    // Build update object
    const updateData: any = {};

    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.date !== undefined) updateData.date = updateDto.date;
    if (updateDto.location !== undefined) updateData.location = updateDto.location;
    if (updateDto.privacy !== undefined) updateData.privacy = updateDto.privacy;
    if (updateDto.invitedFriends !== undefined) updateData.invitedFriends = updateDto.invitedFriends;
    if (updateDto.status !== undefined) updateData.status = updateDto.status;

    updateData.updatedAt = new Date();

    const updatedEvent = await this.eventRepository.update(
      { _id: eventId },
      { $set: updateData }
    );

    if (!updatedEvent) {
      throw new NotFoundException('Event not found after update');
    }

    // Populate before returning
    return await this.eventModel
      .findById(updatedEvent._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .exec() as Event;
  }

  /**
   * Deletes an event (host only)
   */
  async deleteEvent(eventId: string, userId: string): Promise<{ deleted: boolean; message: string }> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can delete
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can delete this event');
    }

    await this.eventRepository.delete({ _id: eventId });

    return {
      deleted: true,
      message: `Event "${event.name}" deleted successfully`,
    };
  }

  /**
   * Toggles RSVP (confirm/cancel attendance)
   */
  async toggleAttendance(dto: AttendEventDTO): Promise<Event> {
    const { eventId, userId } = dto;

    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check event status
    if (event.status === 'past') {
      throw new BadRequestException('Cannot RSVP to past events');
    }

    if (event.status === 'cancelled') {
      throw new BadRequestException('Cannot RSVP to cancelled events');
    }

    // Check if already attending
    const attendeeIndex = event.attendees.findIndex(
      id => id.toString() === userId.toString(),
    );

    if (attendeeIndex > -1) {
      // Cancel RSVP
      event.attendees.splice(attendeeIndex, 1);
    } else {
      // Confirm RSVP
      if (event.privacy === EventPrivacy.PRIVATE) {
        const isInvited = event.invitedFriends.some(id => id.toString() === userId.toString());
        const isHost = event.host.toString() === userId.toString();

        if (!isInvited && !isHost) {
          throw new ForbiddenException('You must be invited to RSVP to this private event');
        }
      }

      event.attendees.push(userId as any);
    }

    const saved = await this.eventRepository.save(event);

    // Populate before returning
    return await this.eventModel
      .findById(saved._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .exec() as Event;
  }

  /**
   * Invites friends to event (host only)
   */
  async inviteFriends(dto: InviteEventDTO, userId: string): Promise<Event> {
    const { eventId, friendIds } = dto;

    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can invite
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can invite friends');
    }

    // Add friends (avoid duplicates)
    friendIds.forEach(friendId => {
      const alreadyInvited = event.invitedFriends.some(id => id.toString() === friendId);
      if (!alreadyInvited) {
        event.invitedFriends.push(friendId as any);
      }
    });

    const saved = await this.eventRepository.save(event);

    // Populate before returning
    return await this.eventModel
      .findById(saved._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('invitedFriends', 'username profilePicture')
      .exec() as Event;
  }
}
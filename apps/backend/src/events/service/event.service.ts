import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from '../repository/event.repository';
import { Event } from '../schema/event.schema';
import { CreateEventDTO } from '../DTOs/create.event.DTO';
import { UpdateEventDTO } from '../DTOs/update.event.DTO';
import { GetEventDTO } from '../DTOs/get.event.DTO';
import { AttendEventDTO } from '../DTOs/attend.event.DTO';
import { InviteEventDTO } from '../DTOs/invite.event.DTO';
import { BadgeCheckerService } from '../../badges/checker/badge-checker.service';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    private readonly badgeCheckerService: BadgeCheckerService,
  ) {}

  /**
   * Creates a new event
   */
  async createEvent(dto: CreateEventDTO): Promise<Event> {
    const newEvent = await this.eventRepository.create(dto as any);

    return await this.eventModel
      .findById(newEvent._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
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
      if (dto.privacy) filter.privacy = dto.privacy;
      if (dto.status) filter.status = dto.status;
    }

    const events = await this.eventRepository.findMany(filter);

    return await this.eventModel
      .find({ _id: { $in: events.map(e => e._id) } })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Retrieves a specific event
   */
  async getEvent(eventId: string, userId?: string): Promise<Event> {
    const event = await this.eventModel
      .findById(eventId)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check privacy: if private, only host, attendees, or invited can view
    if (event.privacy === 'Private Event') {
      if (!userId) {
        throw new ForbiddenException('This is a private event');
      }

      const isHost = event.host._id.toString() === userId;
      const isAttendee = event.attendees.some((a: any) => a._id.toString() === userId);
      const isInvited = event.invitedFriends.some((f: any) => f._id.toString() === userId);

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
    const created = await this.eventModel
      .find({ host: userId })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .sort({ date: -1 })
      .exec();

    const attending = await this.eventModel
      .find({ attendees: userId })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .sort({ date: -1 })
      .exec();

    return { created, attending };
  }

  /**
   * Updates an event (host only)
   */
  async updateEvent(eventId: string, userId: string, dto: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can update
    if (event.host.toString() !== userId) {
      throw new ForbiddenException('Only the event host can update this event');
    }

    const updateData: any = { ...dto, updatedAt: new Date() };

    const updatedEvent = await this.eventRepository.update(
      { _id: eventId },
      { $set: updateData }
    );

    return await this.eventModel
      .findById(updatedEvent?._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
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
    if (event.host.toString() !== userId) {
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
  const event = await this.eventRepository.findById(dto.eventId);

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  // Validate: Cannot RSVP to past events
  if (event.status === 'past' || event.status === 'completed') {
    throw new BadRequestException('Cannot RSVP to past events');
  }

  // Validate: Cannot RSVP to cancelled events
  if (event.status === 'cancelled') {
    throw new BadRequestException('Cannot RSVP to cancelled events');
  }

  // Validate: Private events require invitation
  if (event.privacy === 'Private Event') {
    const isHost = event.host.toString() === dto.userId;
    const isInvited = event.invitedFriends.some((f: any) => f.toString() === dto.userId);
    
    if (!isHost && !isInvited) {
      throw new ForbiddenException('You must be invited to attend this private event');
    }
  }

  const userIndex = event.attendees.indexOf(dto.userId as any);
  let didAddAttendance = false;

  if (userIndex > -1) {
    // Remove attendance
    event.attendees.splice(userIndex, 1);
  } else {
    // Add attendance
    event.attendees.push(dto.userId as any);
    didAddAttendance = true;
  }

  const saved = await this.eventRepository.save(event);

  // Check badges after confirming attendance
  if (didAddAttendance) {
    await this.badgeCheckerService.checkEventBadges(dto.userId);
  }

  return await this.eventModel
    .findById(saved._id)
    .populate('host', 'username profilePicture')
    .populate('place', 'name address')
    .populate('attendees', 'username profilePicture')
    .populate('invitedFriends', 'username profilePicture')
    .exec() as Event;
}

  /**
   * Invites friends to event (host only)
   */
  async inviteFriends(dto: InviteEventDTO, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(dto.eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can invite
    if (event.host.toString() !== userId) {
      throw new ForbiddenException('Only the event host can invite friends');
    }

    // Add friends to invitedFriends list (avoid duplicates)
    for (const friendId of dto.friendIds) {
      if (!event.invitedFriends.includes(friendId as any)) {
        event.invitedFriends.push(friendId as any);
      }
    }

    const saved = await this.eventRepository.save(event);

    return await this.eventModel
      .findById(saved._id)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .exec() as Event;
  }
}
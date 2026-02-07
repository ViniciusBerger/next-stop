import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventPrivacy } from './schema/event.schema';
import { CreateEventDTO } from './DTOs/create.event.DTO';
import { UpdateEventDTO } from './DTOs/update.event.DTO';
import { GetEventDTO } from './DTOs/get.event.DTO';
import { AttendEventDTO } from './DTOs/attend.event.DTO';
import { InviteEventDTO } from './DTOs/invite.event.DTO';

@Injectable()
export class EventService {
  private eventModel: Model<Event>;

  constructor(@InjectModel(Event.name) eventModelReceived: Model<Event>) {
    this.eventModel = eventModelReceived;
  }

  // CREATE - Create a new event
  async createEvent(createEventDTO: CreateEventDTO): Promise<Event> {
    const newEvent = new this.eventModel(createEventDTO);
    return await newEvent.save();
  }

  // GET ALL - Get all events (with optional filters)
  async getAllEvents(getEventDTO?: GetEventDTO): Promise<Event[]> {
    const mongoQuery: any = {};

    if (getEventDTO) {
      if (getEventDTO.host) mongoQuery.host = getEventDTO.host;
      if (getEventDTO.place) mongoQuery.place = getEventDTO.place;
      if (getEventDTO.status) mongoQuery.status = getEventDTO.status;
    }

    return await this.eventModel
      .find(mongoQuery)
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .sort({ date: 1 }) // Upcoming events first
      .exec();
  }

  // GET ONE - Get a specific event by ID (with access control)
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

  // GET USER EVENTS - Get events created by or attended by user
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

  // UPDATE - Update event (host only)
  async updateEvent(
    eventId: string,
    userId: string,
    updateEventDTO: UpdateEventDTO,
  ): Promise<Event> {
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can update event
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can update this event');
    }

    // Build update object
    const updateData: any = {};

    if (updateEventDTO.name !== undefined) updateData.name = updateEventDTO.name;
    if (updateEventDTO.description !== undefined) updateData.description = updateEventDTO.description;
    if (updateEventDTO.date !== undefined) updateData.date = updateEventDTO.date;
    if (updateEventDTO.location !== undefined) updateData.location = updateEventDTO.location;
    if (updateEventDTO.privacy !== undefined) updateData.privacy = updateEventDTO.privacy;
    if (updateEventDTO.invitedFriends !== undefined) updateData.invitedFriends = updateEventDTO.invitedFriends;
    if (updateEventDTO.status !== undefined) updateData.status = updateEventDTO.status;

    updateData.updatedAt = new Date();

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(eventId, { $set: updateData }, { new: true, runValidators: true })
      .populate('host', 'username profilePicture')
      .populate('place', 'name address category customImages')
      .populate('attendees', 'username profilePicture')
      .populate('invitedFriends', 'username profilePicture')
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException('Event not found after update');
    }

    return updatedEvent;
  }

  // DELETE - Delete event (host only)
  async deleteEvent(eventId: string, userId: string): Promise<{ deleted: boolean; message: string }> {
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can delete event
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can delete this event');
    }

    await this.eventModel.findByIdAndDelete(eventId).exec();

    return {
      deleted: true,
      message: `Event "${event.name}" deleted successfully`,
    };
  }

  // ATTEND - Toggle RSVP (confirm/cancel attendance)
  async toggleAttendance(attendEventDTO: AttendEventDTO): Promise<Event> {
    const { eventId, userId } = attendEventDTO;

    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event is in the future
    if (event.status === 'past') {
      throw new BadRequestException('Cannot RSVP to past events');
    }

    if (event.status === 'cancelled') {
      throw new BadRequestException('Cannot RSVP to cancelled events');
    }

    // Check if user already attending
    const attendeeIndex = event.attendees.findIndex(
      id => id.toString() === userId.toString(),
    );

    if (attendeeIndex > -1) {
      // User already attending - CANCEL RSVP
      event.attendees.splice(attendeeIndex, 1);
    } else {
      // User not attending - CONFIRM RSVP
      // For private events, user must be invited
      if (event.privacy === EventPrivacy.PRIVATE) {
        const isInvited = event.invitedFriends.some(id => id.toString() === userId.toString());
        const isHost = event.host.toString() === userId.toString();

        if (!isInvited && !isHost) {
          throw new ForbiddenException('You must be invited to RSVP to this private event');
        }
      }

      event.attendees.push(userId as any);
    }

    return await event.save();
  }

  // INVITE - Invite friends to event (host only)
  async inviteFriends(inviteEventDTO: InviteEventDTO, userId: string): Promise<Event> {
    const { eventId, friendIds } = inviteEventDTO;

    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only host can invite
    if (event.host.toString() !== userId.toString()) {
      throw new ForbiddenException('Only the event host can invite friends');
    }

    // Add friends to invitedFriends (avoid duplicates)
    friendIds.forEach(friendId => {
      const alreadyInvited = event.invitedFriends.some(id => id.toString() === friendId);
      if (!alreadyInvited) {
        event.invitedFriends.push(friendId as any);
      }
    });

    return await event.save();
  }
}
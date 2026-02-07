import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Enum for privacy options
export enum EventPrivacy {
  PUBLIC = 'Public Event',
  PRIVATE = 'Private Event'
}

// Enum for event status
export enum EventStatus {
  UPCOMING = 'upcoming',
  PAST = 'past',
  CANCELLED = 'cancelled'
}

@Schema({ collection: 'Event' })
export class Event extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  location: string; // Text location (e.g., "Main dining area")

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  place: Types.ObjectId; // Reference to the Place where event happens

  @Prop({ type: String, enum: Object.values(EventPrivacy), default: EventPrivacy.PUBLIC })
  privacy: string; // "Public Event" or "Private Event"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  host: Types.ObjectId; // User who created the event

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  attendees: Types.ObjectId[]; // Users who confirmed attendance (RSVP)

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  invitedFriends: Types.ObjectId[]; // Users invited to the event

  @Prop({ type: String, enum: Object.values(EventStatus), default: EventStatus.UPCOMING })
  status: string; // "upcoming", "past", or "cancelled"

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const eventSchema = SchemaFactory.createForClass(Event);
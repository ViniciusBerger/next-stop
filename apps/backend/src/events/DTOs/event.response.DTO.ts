import { Exclude, Expose } from 'class-transformer';

export class EventResponseDTO {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  date: Date;

  @Expose()
  location: string;

  @Expose()
  place: any; // Can be populated with Place details

  @Expose()
  privacy: string;

  @Expose()
  host: any; // Can be populated with User details

  @Expose()
  attendees: any[]; // Can be populated with User details

  @Expose()
  invitedFriends: any[]; // Can be populated with User details

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // No fields to exclude - all are public
}
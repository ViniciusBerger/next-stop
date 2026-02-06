import { Exclude, Expose } from 'class-transformer';

export class OutingResponseDTO {
  @Expose()
  _id: string;

  @Expose()
  user: any; // Can be populated with User details

  @Expose()
  place: any; // Can be populated with Place details

  @Expose()
  description: string;

  @Expose()
  images: string[];

  @Expose()
  date: Date;

  @Expose()
  likes: number;

  @Expose()
  likedBy: any[]; // Can be populated with User details

  @Expose()
  createdAt: Date;

  // No fields to exclude - all are public for feed display
}
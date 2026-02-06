import { Exclude, Expose } from 'class-transformer';

export class ReviewResponseDTO {
  @Expose()
  _id: string;

  @Expose()
  author: any; // Can be populated with User details

  @Expose()
  place: any; // Can be populated with Place details

  @Expose()
  event: any; // Can be populated with Event details (optional)

  @Expose()
  rating: number;

  @Expose()
  reviewText: string;

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

  // No fields to exclude - all are public
}
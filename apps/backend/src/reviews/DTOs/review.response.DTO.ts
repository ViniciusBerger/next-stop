// review.response.DTO.ts
import { Expose, Transform, Type } from 'class-transformer';


/**
 * AuthorDTO and PlaceDTO are defined here intentionally as nested response classes.
 *
 * When Mongoose populates 'author' and 'place', they resolve from ObjectIds into
 * full nested objects (e.g. author becomes { _id, username, profilePicture, email... }).
 * 
 * Without dedicated DTO classes, plainToInstance() has no way to know which fields
 * to expose on those nested objects when excludeExtraneousValues: true is set.
 * This caused two problems:
 *   1. All nested fields were stripped entirely, returning author: {} and place: {}
 *   2. Or sensitive nested fields leaked through without any filtering
 *
 * By defining AuthorDTO and PlaceDTO with explicit @Expose() decorators, and
 * linking them via @Type(() => AuthorDTO) and @Type(() => PlaceDTO) on the parent,
 * class-transformer knows exactly which nested fields to include and which to strip.
 *
 */
class AuthorDTO {
  @Expose()
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Expose()
  username: string;

  @Expose()
  profilePicture:string;
}

class PlaceDTO {
  @Expose() name: string;
  @Expose() address: string;
  @Expose() category: string;
}

export class ReviewResponseDTO {
  @Expose()
  @Transform(({ value }) => value?.toString())
  _id: string;
  
  @Expose()
  @Type(() => AuthorDTO) // tells class-transformer how to handle nested object
  author: AuthorDTO; // Populated with User details

  @Expose()
  @Type(() => PlaceDTO)
  place: PlaceDTO; // Populated with Place details

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
  @Type(() => AuthorDTO)
  likedBy: AuthorDTO[]; // Populated with User details

  @Expose()
  createdAt: Date;

    // No fields to exclude - all are public
}
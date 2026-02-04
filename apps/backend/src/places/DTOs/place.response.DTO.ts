import { Exclude, Expose } from 'class-transformer';

export class PlaceResponseDTO {
  @Expose()
  _id: string;

  @Expose()
  googlePlaceId: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  category: string;

  @Expose()
  description: string;

  @Expose()
  customImages: string[];

  @Expose()
  customTags: string[];

  @Expose()
  averageUserRating: number;

  @Expose()
  totalUserReviews: number;

  @Expose()
  createdBy: any; // User reference (can be populated)

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // No fields to exclude for Place (all are public)
}
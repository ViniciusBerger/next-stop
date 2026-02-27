import { Exclude, Expose } from 'class-transformer';

class LocationResponseDTO {
  @Expose()
  type: string;

  @Expose()
  coordinates: number[];
}

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
  description?: string;

  @Expose()
  priceLevel?: number;

  @Expose()
  location?: LocationResponseDTO;

  @Expose()
  customImages: string[];

  @Expose()
  customTags: string[];

  @Expose()
  averageUserRating: number;

  @Expose()
  totalUserReviews: number;

  @Expose()
  createdBy?: any;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
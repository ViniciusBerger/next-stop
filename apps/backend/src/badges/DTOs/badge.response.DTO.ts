import { Exclude, Expose } from 'class-transformer';

export class BadgeResponseDTO {
  @Expose()
  _id: string;

  @Expose()
  badgeId: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  category: string;

  @Expose()
  iconUrl: string;

  @Expose()
  tier?: string;

  @Expose()
  totalAwarded: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
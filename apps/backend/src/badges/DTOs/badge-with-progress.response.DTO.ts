import { Expose } from 'class-transformer';

export class BadgeProgressDTO {
  @Expose()
  current: number;

  @Expose()
  target: number;
}

export class BadgeWithProgressResponseDTO {
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
  earned: boolean;

  @Expose()
  earnedAt?: Date;

  @Expose()
  progress: BadgeProgressDTO;
}
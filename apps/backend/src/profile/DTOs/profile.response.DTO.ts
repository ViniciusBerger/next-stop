import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class PreferencesResponseDTO {
  @Expose()
  cuisine: string;

  @Expose()
  dietaryLabels: string;

  @Expose()
  allergies: string;

  @Expose()
  activities: string;
}

export class PrivacyResponseDTO {
  @Expose()
  activityFeed: string;

  @Expose()
  favorites: string;

  @Expose()
  myEvents: string;

  @Expose()
  badges: string;

  @Expose()
  preferences: string;
}

export class ProfileResponseDTO {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  //  expose full profile object as-is
  @Expose()
  @Transform(({ obj }) => obj.profile)
  profile: any;

  @Expose()
  badges: any[];

  @Expose()
  friends: any[];

  @Exclude()
  firebaseUid: string;

  @Exclude()
  role: string;

  @Exclude()
  isBanned: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  lastLogin: Date;
}
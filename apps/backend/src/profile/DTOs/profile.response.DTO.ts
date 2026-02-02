import { Exclude, Expose, Type } from 'class-transformer';

// Response DTO for Preferences
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

// Response DTO for Privacy
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

// Main response DTO from Profile
export class ProfileResponseDTO {
  @Expose()
  @Type(() => PreferencesResponseDTO)
  preferences: PreferencesResponseDTO;

  @Expose()
  @Type(() => PrivacyResponseDTO)
  privacy: PrivacyResponseDTO;

  // User fields that will be exported as well
  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  profilePicture: string;

  @Expose()
  badges: any[];

  @Expose()
  friends: any[];

  // Exclude sensitive fields
  @Exclude()
  _id: string;

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
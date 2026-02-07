import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum EventPrivacy {
  PUBLIC = 'Public Event',
  PRIVATE = 'Private Event'
}

export class CreateEventDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date string

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  location: string; // e.g., "Main dining area", "Garden patio"

  @IsString()
  @IsNotEmpty()
  place: string; // Place ID (MongoDB _id)

  @IsEnum(EventPrivacy)
  privacy: string; // "Public Event" or "Private Event"

  @IsString()
  @IsNotEmpty()
  host: string; // User ID (firebaseUid or MongoDB _id)

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invitedFriends?: string[]; // Array of User IDs to invite
}
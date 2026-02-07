import { IsString, IsOptional, IsArray, IsDateString, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum EventPrivacy {
  PUBLIC = 'Public Event',
  PRIVATE = 'Private Event'
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  PAST = 'past',
  CANCELLED = 'cancelled'
}

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string; // ISO date string

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsEnum(EventPrivacy)
  privacy?: string; // "Public Event" or "Private Event"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invitedFriends?: string[]; // Array of User IDs

  @IsOptional()
  @IsEnum(EventStatus)
  status?: string; // "upcoming", "past", "cancelled"
}
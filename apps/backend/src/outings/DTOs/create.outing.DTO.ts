import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateOutingDTO {
  @IsString()
  @IsNotEmpty()
  user: string; // User ID (firebaseUid or MongoDB _id)

  @IsString()
  @IsNotEmpty()
  place: string; // Place ID (MongoDB _id or googlePlaceId)

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // URLs to images

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date string (e.g., "2026-01-15")
}
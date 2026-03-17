import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, Min, Max, MinLength, MaxLength, IsDateString } from 'class-validator';

export class CreateReviewDTO {
  @IsString()
  @IsNotEmpty()
  author: string; // User ID (firebaseUid or MongoDB _id)

  @IsString()
  @IsNotEmpty()
  place: string; // Place ID (MongoDB _id) - REQUIRED

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  event?: string; // Event ID (MongoDB _id) - OPTIONAL

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  reviewText: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // URLs to images

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date string - when user visited the place
}
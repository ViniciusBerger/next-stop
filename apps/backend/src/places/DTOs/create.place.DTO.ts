import { IsString, IsNotEmpty, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreatePlaceDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  googlePlaceId: string; // Google Place ID (unique identifier)

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  category: string; // Restaurant, Pub, Park, Museum, etc

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string; // editorial_summary from Google

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customImages?: string[]; // URLs to images

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customTags?: string[]; // cuisine, ambiance, etc

  @IsOptional()
  @IsString()
  createdBy?: string; // User firebaseUid
}
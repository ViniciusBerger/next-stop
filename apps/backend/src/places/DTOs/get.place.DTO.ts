import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GetPlaceDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string; // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  googlePlaceId?: string; // Google Place ID

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string; // Search by name (partial match)

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string; // Filter by category
}
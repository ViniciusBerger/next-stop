import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  maxPriceLevel?: number; // PRICE LEVEL FILTER - Ex: maxPriceLevel=2 → it shows 0, 1, 2 (Free, $, $$)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number; // LOCATION FILTER - latitude

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number; // LOCATION FILTER - longitude

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50000) // Max 50km radius
  radiusMeters?: number; // Default: 5000 (5km)
}
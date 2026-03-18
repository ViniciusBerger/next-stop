import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPlaceDTO {

  @IsOptional()
  @IsString()
  id?: string;   // ADD THIS LINE 

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  _id?: string; // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  googlePlaceId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  priceLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  maxPriceLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50000)
  radiusMeters?: number;
}
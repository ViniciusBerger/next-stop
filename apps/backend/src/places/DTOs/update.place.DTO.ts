import { IsString, IsOptional, IsNumber, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDTO {
  @IsString()
  type: string;

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];
}

export class UpdatePlaceDTO {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  priceLevel?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDTO)
  location?: LocationDTO;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customImages?: string[];

  @IsOptional()
  @IsNumber()
  googleRating?: number;

  @IsOptional()
  @IsNumber()
  googleReviewCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  googlePhotos?: string[];

  @IsOptional()
  openingHours?: any;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDTO {
  @IsString()
  @IsNotEmpty()
  type: string; // 'Point'

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]
}

export class CreatePlaceDTO {
  @IsString()
  @IsNotEmpty()
  googlePlaceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  // PRICE LEVEL
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  priceLevel?: number;

  // LOCATION
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDTO)
  location?: LocationDTO;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customTags?: string[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}
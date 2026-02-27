import { IsString, IsOptional, IsArray, IsNumber, Min, Max, ValidateNested } from 'class-validator';
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
}
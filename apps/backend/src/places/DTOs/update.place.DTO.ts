import { IsString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';

export class UpdatePlaceDTO {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customTags?: string[];

  // These fields are updated by the system, not directly by users
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averageUserRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalUserReviews?: number;
}
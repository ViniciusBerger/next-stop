import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GetBadgeDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;  // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  badgeId?: string;  // "trendsetter"

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;  // Filter by category

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tier?: string;  // Filter by tier
}
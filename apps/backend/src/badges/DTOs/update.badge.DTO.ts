import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateBadgeDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;  // Admin updates this when designer provides

  @IsOptional()
  @IsString()
  tier?: string;
}
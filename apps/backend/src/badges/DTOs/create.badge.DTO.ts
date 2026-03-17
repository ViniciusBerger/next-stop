import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBadgeDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  badgeId: string;  // "trendsetter"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;  // "The Trendsetter"

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;  // "Have 10 people join an event you created"

  @IsString()
  @IsNotEmpty()
  category: string;  // "Social & Community"

  @IsOptional()
  @IsString()
  iconUrl?: string;  // Firebase Storage URL (optional initially)

  @IsOptional()
  @IsString()
  tier?: string;  // "Bronze", "Silver", "Gold"
}
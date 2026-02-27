import { IsString, IsNotEmpty } from 'class-validator';

export class AwardBadgeDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  badgeId: string; // "trendsetter", "social-butterfly", etc
}
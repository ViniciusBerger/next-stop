import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportType {
  FEEDBACK = 'feedback',
  ISSUE = 'issue'
}

export enum ReportedItemType {
  USER = 'User',
  REVIEW = 'Review',
  PLACE = 'Place',
  EVENT = 'Event'
}

// DTO for reported item (optional)
export class ReportedItemDTO {
  @IsEnum(ReportedItemType)
  itemType: string; // "User", "Review", "Place", or "Event"

  @IsString()
  @IsNotEmpty()
  itemId: string; // ID of the reported item
}

export class CreateReportDTO {
  @IsEnum(ReportType)
  type: string; // "feedback" or "issue"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsString()
  @IsNotEmpty()
  reportedBy: string; // User ID (firebaseUid or MongoDB _id)

  @IsOptional()
  @ValidateNested()
  @Type(() => ReportedItemDTO)
  reportedItem?: ReportedItemDTO; // Optional - what is being reported
}
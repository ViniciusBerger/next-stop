import { IsString, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enum for privacy validation
export enum PrivacyOption {
  ALL = 'All',
  FRIENDS = 'Friends',
  NONE = 'None'
}

// DTO for Preferences
export class PreferencesDTO {
  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  dietaryLabels?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  activities?: string;
}

// DTO for Privacy
export class PrivacyDTO {
  @IsOptional()
  @IsEnum(PrivacyOption)
  activityFeed?: string;

  @IsOptional()
  @IsEnum(PrivacyOption)
  favorites?: string;

  @IsOptional()
  @IsEnum(PrivacyOption)
  myEvents?: string;

  @IsOptional()
  @IsEnum(PrivacyOption)
  badges?: string;

  @IsOptional()
  @IsEnum(PrivacyOption)
  preferences?: string;
}

// Main DTO for updates
export class UpdateProfileDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDTO)
  preferences?: PreferencesDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacyDTO)
  privacy?: PrivacyDTO;
}
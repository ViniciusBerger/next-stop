import { IsString, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PrivacyOption {
  ALL = 'All',
  FRIENDS = 'Friends',
  NONE = 'None'
}

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

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  profilePicture?: string; //  ADDED

  @IsOptional()
  @IsString()
  bio?: string; //  ADDED

  @IsOptional()
  @IsString()
  username?: string; //  ADDED

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDTO)
  preferences?: PreferencesDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacyDTO)
  privacy?: PrivacyDTO;
}
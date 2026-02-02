import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class GetProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(20)
  firebaseUid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;
}
import { IsString, IsOptional } from 'class-validator';

export class GetUserDTO {
  @IsOptional()
  @IsString()
  firebaseUid?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
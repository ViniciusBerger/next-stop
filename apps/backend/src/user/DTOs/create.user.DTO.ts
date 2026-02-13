import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../user.role.enum';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.MEMBER;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}
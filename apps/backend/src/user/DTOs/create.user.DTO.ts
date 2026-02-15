import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  Length, 
  IsEnum,
} from 'class-validator';
import { UserRole } from '../user.role.enum';

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    @Length(28, 28) 
    firebaseUid: string;
    
    @IsEnum(UserRole)
    @IsOptional() // Optional because schema has a default "member"
    role?: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;
    
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsOptional()
    // @ValidateNested() 
    // @Type(() => CreateProfileDTO)
    profile?: any; 

    
}
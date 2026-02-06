import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, Length, IsEnum } from 'class-validator';
import { UserRole } from '../user.role.enum';


export class CreateUserDTO {
    @IsString()
    @IsOptional()
    @IsString()
    @Length(28, 28) 
    firebaseUid: string;
    
    @IsString()
    @IsEnum(UserRole)
    @IsNotEmpty()
    @MinLength(4)
    role: string;
    
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
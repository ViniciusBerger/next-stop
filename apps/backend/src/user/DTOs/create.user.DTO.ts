import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, Length, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../user.role.enum';

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    @Length(28, 28) 
    firebaseUid: string;
    
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole; // Typed to Enum, not string
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30) // Decent username size
    username: string;
    
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Object) // Replace 'Object' with CreateProfileDTO when ready
    profile?: any; 
}
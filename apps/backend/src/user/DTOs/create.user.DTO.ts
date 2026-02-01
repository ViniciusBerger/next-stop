import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Min, IsStrongPassword } from 'class-validator';


export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(24)
    @MaxLength(36)
    firebaseUid: string;
    
    @IsString()
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
    
    @IsString()
    bio?: string;
    
    @IsString()
    profilePicture?: string;
}
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Min, IsStrongPassword } from 'class-validator';


export class EditUserDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;
    
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;
    
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
    
    @IsString()
    @IsNotEmpty()
    bio?: string;
    
    @IsString()
    profilePicture?: string;
}
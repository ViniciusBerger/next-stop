import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class RegisterUserDTO {
    
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password is too short (min 8 characters)' })
    @MaxLength(20, { message: 'Password is too long' })
    password: string

    @IsString()
    displayName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;
               
}
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Min, IsStrongPassword, IsOptional } from 'class-validator';


export class EditUserDTO {

    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;
    
    @IsOptional()
    @IsString()
    bio?: string;
    
    @IsOptional()
    @IsString()
    profilePicture?: string;
}
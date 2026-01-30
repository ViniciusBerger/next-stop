import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Min, IsStrongPassword, IsOptional } from 'class-validator';


export class GetUserDTO {
    @IsOptional() 
    @IsString()
    @MinLength(20)
    firebaseUid?: string; 

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;
}
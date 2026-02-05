import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Min, IsStrongPassword, IsOptional } from 'class-validator';


export class DeleteUserDTO {
    @IsString()
    @MinLength(24)
    firebaseUid: string; 
}
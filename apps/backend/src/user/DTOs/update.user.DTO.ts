import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';


export class UpdateUserDTO {

    @IsString()
    @IsNotEmpty()
    firebaseUid: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(255)
    username?: string;
    
}
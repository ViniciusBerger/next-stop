import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';


export class EditUserDTO {

    @IsString()
    @IsNotEmpty()
    firebaseUid: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(255)
    username?: string;
    
    @IsOptional()
    @IsString()
    bio?: string;
    
    @IsOptional()
    @IsString()
    profilePicture?: string;
}
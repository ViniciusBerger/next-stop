
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';


export class GetUserDTO {
    @IsOptional() 
    @IsString()
    @MinLength(20)
    firebaseUid?: string; 

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;

    constructor(user: any) {
        this.firebaseUid = user.uid
        this.username = user.username
    }

}
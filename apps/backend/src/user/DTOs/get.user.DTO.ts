import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

/**
 * Filter criteria for retrieving a user.
 * Used for GET requests /users?username=...
 */
export class GetUserDTO {
    // Unique Firebase Identity 
    @IsOptional() 
    @IsString()
    @MinLength(20)
    firebaseUid: string; 

    // Public display name 
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;
}
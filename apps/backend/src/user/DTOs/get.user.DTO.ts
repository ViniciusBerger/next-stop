import { IsString, IsNotEmpty, MinLength, IsOptional, ValidateIf } from 'class-validator';

/**
 * Filter criteria for retrieving a user.
 * Used for GET requests /users?username=...
 */
export class GetUserDTO {

    constructor(partial: Partial<GetUserDTO>) {
        Object.assign(this, partial)
    }
    
    @IsOptional()
    @IsString()
    @MinLength(28)
    // If username is missing, firebaseUid is no longer optional
    @ValidateIf(o => !o.username)
    firebaseUid?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    // If firebaseUid is missing, username is no longer optional
    @ValidateIf(o => !o.firebaseUid)
    username?: string;
}
import { IsString, Length, IsNotEmpty } from 'class-validator';

// Firebase UID standard length constant based on firebase docs.
const FB_UID_LENGTH = 28;

/**
 * Data Transfer Object for identifying a user for deletion.
 *
 */
export class DeleteUserDTO {
    // Standard Firebase UIDs are 28 characters.
    @IsNotEmpty()
    @IsString()
    @Length(FB_UID_LENGTH, FB_UID_LENGTH, { message: `friendUid must be exactly ${FB_UID_LENGTH} characters.` })
    firebaseUid: string; 
}
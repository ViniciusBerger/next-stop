import { IsString, Length, IsNotEmpty } from "class-validator";

// Firebase UID standard length constant based on firebase docs.
const FB_UID_LENGTH = 28;

/**
 * Payload for sending or responding to friend requests.
 */

export class FriendRequestDTO {
    
    //Partial constructor allows for manual instantiation if needed
    constructor(partial: Partial<string>) {
        Object.assign(this, partial);
    }
    
    // The unique Firebase ID of the target friend.
    @IsNotEmpty()
    @IsString()
    @Length(FB_UID_LENGTH, FB_UID_LENGTH, { message: `friendUid must be exactly ${FB_UID_LENGTH} characters.` })
    friendUid: string;
}
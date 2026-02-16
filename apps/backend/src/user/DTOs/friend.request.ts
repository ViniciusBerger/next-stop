import { IsString, Length } from "class-validator";

export class FriendRequestDTO {
    @IsString()
    @Length(28, 28) 
    friendUid: string; 
}
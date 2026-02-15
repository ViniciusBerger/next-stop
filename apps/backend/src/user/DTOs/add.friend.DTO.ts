import { IsOptional, IsString, Length } from "class-validator";

export class AddFriendDTO {
    @IsString()
    @Length(28, 28) 
    friendUid: string; 
}
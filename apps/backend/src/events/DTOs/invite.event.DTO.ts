import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class InviteEventDTO {
  @IsString()
  @IsNotEmpty()
  eventId: string; // Event MongoDB _id

  @IsArray()
  @IsString({ each: true })
  friendIds: string[]; // Array of User IDs to invite
}
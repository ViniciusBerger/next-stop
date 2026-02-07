import { IsString, IsNotEmpty } from 'class-validator';

export class AttendEventDTO {
  @IsString()
  @IsNotEmpty()
  eventId: string; // Event MongoDB _id

  @IsString()
  @IsNotEmpty()
  userId: string; // User ID (firebaseUid or MongoDB _id)
}
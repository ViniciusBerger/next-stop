import { IsString, IsNotEmpty } from 'class-validator';

export class LikeOutingDTO {
  @IsString()
  @IsNotEmpty()
  outingId: string; // Outing MongoDB _id

  @IsString()
  @IsNotEmpty()
  userId: string; // User ID (firebaseUid or MongoDB _id)
}
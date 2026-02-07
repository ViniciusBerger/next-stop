import { IsString, IsNotEmpty } from 'class-validator';

export class LikeReviewDTO {
  @IsString()
  @IsNotEmpty()
  reviewId: string; // Review MongoDB _id

  @IsString()
  @IsNotEmpty()
  userId: string; // User ID (firebaseUid or MongoDB _id)
}
import { IsString, IsNotEmpty } from "class-validator";

/**
 * DTO for creating a friend request.
 * Body: { fromFirebaseUid: string; toFirebaseUid: string }
 */
export class CreateFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  fromFirebaseUid!: string;

  @IsString()
  @IsNotEmpty()
  toFirebaseUid!: string;
}
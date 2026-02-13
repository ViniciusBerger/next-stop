import { IsString, IsNotEmpty } from "class-validator";

/**
 * DTO for cancel request body.
 * Only the sender of the request can cancel it.
 * Body: { senderFirebaseUid: string }
 */
export class CancelFriendRequestBodyDto {
  @IsString()
  @IsNotEmpty()
  senderFirebaseUid!: string;
}
import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for listing friend requests by user.
 * Query: { firebaseUid, type, status?, limit?, skip? }
 * - type: 'received' | 'sent'
 * - status: 'pending' | 'accepted' | 'rejected' | 'cancelled' (optional)
 */
export class ListFriendRequestsQueryDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @IsString()
  @IsIn(["received", "sent"])
  type!: "received" | "sent";

  @IsOptional()
  @IsString()
  @IsIn(["pending", "accepted", "rejected", "cancelled"])
  status?: "pending" | "accepted" | "rejected" | "cancelled";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;
}
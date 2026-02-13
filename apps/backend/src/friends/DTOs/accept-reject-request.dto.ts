import { IsString } from "class-validator";

/**
 * DTO for path params of accept/reject endpoints.
 * Param: :id (friend request ObjectId as string)
 */
export class AcceptRejectRequestParamDto {
  @IsString()
  id!: string;
}
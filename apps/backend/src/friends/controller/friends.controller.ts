import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { FriendsService } from "../service/friends.service";
// DTOs
import { CreateFriendRequestDto } from "../DTOs/create-friend-request.dto";
import { AcceptRejectRequestParamDto } from "../DTOs/accept-reject-request.dto";
import { CancelFriendRequestBodyDto } from "../DTOs/cancel-friend-request.dto";
import { ListFriendRequestsQueryDto } from "../DTOs/list-friend-requests.dto";
import {
  ListFriendsParamDto,
  ListFriendsQueryDto,
} from "../DTOs/list-friends.dto";
import { UnfriendParamDto } from "../DTOs/unfriend.dto";


/**
 * FriendsController
 *
 * REST endpoints for the friends flow.
 * Authentication is not wired here; endpoints receive firebaseUid via path/body.
 * When authentication is available, these can be adapted to use the authenticated user.
 */
@Controller("friends")
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Create a friend request (pending) from one firebaseUid to another.
   * POST /friends/requests
   * Body: { fromFirebaseUid: string, toFirebaseUid: string }
   */
  @Post("requests")
  async createRequest(@Body() body: CreateFriendRequestDto) {
    const request = await this.friendsService.requestFriend(
      body.fromFirebaseUid,
      body.toFirebaseUid
    );
    return { message: "Friend request sent", request };
  }

  /**
   * Accept a pending friend request.
   * POST /friends/requests/:id/accept
   * Param: { id: string }
   */
  @Post("requests/:id/accept")
  async acceptRequest(@Param() params: AcceptRejectRequestParamDto) {
    const updated = await this.friendsService.acceptRequest(params.id);
    return { message: "Friend request accepted", request: updated };
  }

  /**
   * Reject a pending friend request.
   * POST /friends/requests/:id/reject
   * Param: { id: string }
   */
  @Post("requests/:id/reject")
  async rejectRequest(@Param() params: AcceptRejectRequestParamDto) {
    const updated = await this.friendsService.rejectRequest(params.id);
    return { message: "Friend request rejected", request: updated };
  }

  /**
   * Cancel a pending request (only the sender can cancel).
   * POST /friends/requests/:id/cancel
   * Param: { id: string }
   * Body: { senderFirebaseUid: string }
   */
  @Post("requests/:id/cancel")
  async cancelRequest(
    @Param() params: AcceptRejectRequestParamDto,
    @Body() body: CancelFriendRequestBodyDto
  ) {
    const updated = await this.friendsService.cancelRequest(
      params.id,
      body.senderFirebaseUid
    );
    return { message: "Friend request cancelled", request: updated };
  }

  /**
   * Remove a friendship edge (unfriend).
   * DELETE /friends/:firebaseUid/:friendFirebaseUid
   * Param: { firebaseUid: string; friendFirebaseUid: string }
   */
  @Delete(":firebaseUid/:friendFirebaseUid")
  async unfriend(@Param() params: UnfriendParamDto) {
    const removed = await this.friendsService.unfriend(
      params.firebaseUid,
      params.friendFirebaseUid
    );
    return { message: "Unfriended successfully", removed };
  }

  /**
   * List friendships for a user identified by firebaseUid, with pagination.
   * GET /friends/:firebaseUid?limit=&skip=
   * Param: { firebaseUid: string }
   * Query: { limit?: number; skip?: number }
   */
  @Get(":firebaseUid")
  async listFriends(
    @Param() params: ListFriendsParamDto,
    @Query() query: ListFriendsQueryDto
  ) {
    return this.friendsService.listFriends(
      params.firebaseUid,
      query.limit,
      query.skip
    );
  }

  /**
   * List requests received or sent by a user, with optional status and pagination.
   * GET /friends/requests?firebaseUid=...&type=received|sent&status=pending&limit=20&skip=0
   * Query: { firebaseUid: string; type: 'received'|'sent'; status?: 'pending'|'accepted'|'rejected'|'cancelled'; limit?: number; skip?: number }
   */
  @Get("requests")
  async listRequests(@Query() query: ListFriendRequestsQueryDto) {
    return this.friendsService.listRequests(
      query.firebaseUid,
      query.type,
      query.status,
      query.limit,
      query.skip
    );
  }
}
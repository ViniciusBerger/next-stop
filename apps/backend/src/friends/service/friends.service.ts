import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FriendsRepository } from "../friends.repository";
import { User } from "../../user/schemas/user.schema";

// NOTE:
// This service implements the friends flow.
// Implemented: requestFriend, acceptRequest, rejectRequest, unfriend, listFriends.
// New in this patch: listRequests, cancelRequest.

type RequestType = "received" | "sent";
type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsRepository: FriendsRepository,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async requestFriend(fromFirebaseUid: string, toFirebaseUid: string) {
    if (!fromFirebaseUid || !toFirebaseUid) {
      throw new BadRequestException("Both fromFirebaseUid and toFirebaseUid are required");
    }
    if (fromFirebaseUid === toFirebaseUid) {
      throw new BadRequestException("You cannot send a friend request to yourself");
    }

    const [fromUser, toUser] = await Promise.all([
      this.userModel.findOne({ firebaseUid: fromFirebaseUid }).exec(),
      this.userModel.findOne({ firebaseUid: toFirebaseUid }).exec(),
    ]);

    if (!fromUser) throw new NotFoundException("Sender user not found");
    if (!toUser) throw new NotFoundException("Recipient user not found");

    const fromId = new Types.ObjectId(fromUser._id);
    const toId = new Types.ObjectId(toUser._id);

    const existing = await this.friendsRepository.findRequest({
      from: fromId,
      to: toId,
      status: "pending",
    });
    if (existing) {
      throw new BadRequestException("There is already a pending request for this pair");
    }

    return this.friendsRepository.createRequest(fromId, toId);
  }

  async acceptRequest(requestId: string) {
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException("Invalid requestId");
    }

    const req = await this.friendsRepository.findRequest({
      _id: new Types.ObjectId(requestId),
    });
    if (!req) throw new NotFoundException("Friend request not found");
    if (req.status !== "pending") {
      throw new BadRequestException("Only pending requests can be accepted");
    }

    await this.friendsRepository.createFriendship(req.from as Types.ObjectId, req.to as Types.ObjectId);

    const updated = await this.friendsRepository.updateRequestStatus(
      req._id as any,
      "accepted"
    );
    return updated;
  }

  async rejectRequest(requestId: string) {
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException("Invalid requestId");
    }

    const req = await this.friendsRepository.findRequest({
      _id: new Types.ObjectId(requestId),
    });
    if (!req) throw new NotFoundException("Friend request not found");
    if (req.status !== "pending") {
      throw new BadRequestException("Only pending requests can be rejected");
    }

    const updated = await this.friendsRepository.updateRequestStatus(
      req._id as any,
      "rejected"
    );
    return updated;
  }

  async unfriend(fromFirebaseUid: string, friendFirebaseUid: string) {
    if (!fromFirebaseUid || !friendFirebaseUid) {
      throw new BadRequestException("Both fromFirebaseUid and friendFirebaseUid are required");
    }
    if (fromFirebaseUid === friendFirebaseUid) {
      throw new BadRequestException("You cannot unfriend yourself");
    }

    const [fromUser, friendUser] = await Promise.all([
      this.userModel.findOne({ firebaseUid: fromFirebaseUid }).exec(),
      this.userModel.findOne({ firebaseUid: friendFirebaseUid }).exec(),
    ]);

    if (!fromUser) throw new NotFoundException("User not found");
    if (!friendUser) throw new NotFoundException("Friend user not found");

    const fromId = new Types.ObjectId(fromUser._id);
    const friendId = new Types.ObjectId(friendUser._id);

    const removed = await this.friendsRepository.removeFriendship(fromId, friendId);
    return removed;
  }

  async listFriends(firebaseUid: string, limit = 20, skip = 0) {
    if (!firebaseUid) throw new BadRequestException("firebaseUid is required");

    const user = await this.userModel.findOne({ firebaseUid }).exec();
    if (!user) throw new NotFoundException("User not found");

    const userId = new Types.ObjectId(user._id);
    return this.friendsRepository.listFriends(userId, limit, skip);
  }

  /**
   * List friend requests for a user identified by firebaseUid.
   * - type: 'received' | 'sent'
   * - status (optional): 'pending' | 'accepted' | 'rejected' | 'cancelled'
   * - pagination: limit, skip
   */
  async listRequests(
    firebaseUid: string,
    type: RequestType,
    status?: RequestStatus,
    limit = 20,
    skip = 0
  ) {
    if (!firebaseUid) throw new BadRequestException("firebaseUid is required");
    if (!type || !["received", "sent"].includes(type)) {
      throw new BadRequestException("type must be 'received' or 'sent'");
    }

    const user = await this.userModel.findOne({ firebaseUid }).exec();
    if (!user) throw new NotFoundException("User not found");

    const userId = new Types.ObjectId(user._id);
    const filter: Record<string, any> = type === "received" ? { to: userId } : { from: userId };
    if (status) filter.status = status;

    return this.friendsRepository.listRequests(filter, limit, skip);
  }

  /**
   * Cancel a pending request sent by the given sender firebaseUid.
   * Only the sender can cancel a request, and only if it is 'pending'.
   */
  async cancelRequest(requestId: string, senderFirebaseUid: string) {
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException("Invalid requestId");
    }
    if (!senderFirebaseUid) {
      throw new BadRequestException("senderFirebaseUid is required");
    }

    const [req, sender] = await Promise.all([
      this.friendsRepository.findRequest({ _id: new Types.ObjectId(requestId) }),
      this.userModel.findOne({ firebaseUid: senderFirebaseUid }).exec(),
    ]);

    if (!req) throw new NotFoundException("Friend request not found");
    if (!sender) throw new NotFoundException("Sender user not found");
    if (req.status !== "pending") {
      throw new BadRequestException("Only pending requests can be cancelled");
    }

    const senderId = (sender._id as any).toString?.() ?? String(sender._id);
    const fromId = (req.from as any).toString?.() ?? String(req.from);

    if (senderId !== fromId) {
      throw new BadRequestException("Only the request sender can cancel the request");
    }

    const updated = await this.friendsRepository.updateRequestStatus(
      req._id as any,
      "cancelled"
    );
    return updated;
  }
}
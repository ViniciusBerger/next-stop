import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FriendRequest } from "./schemas/friend-request.schema";
import { Friendship } from "./schemas/friendship.schema";

/**
 * FriendsRepository
 *
 * Encapsulates Mongoose operations for FriendRequest and Friendship.
 * We avoid using `FilterQuery` here to prevent version/type mismatches,
 * and rely on a safe generic `Record<string, any>` as filter type.
 */
type AnyFilter = Record<string, any>;

@Injectable()
export class FriendsRepository {
  constructor(
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<Friendship>
  ) {}

  // ---------- FriendRequest ----------

  /**
   * Create a new friend request in `pending` state.
   */
  async createRequest(from: Types.ObjectId, to: Types.ObjectId) {
    const doc = new this.friendRequestModel({ from, to, status: "pending" });
    return doc.save();
    // NOTE: Unique partial index on (from,to,status=pending) avoids duplicates.
  }

  /**
   * Find a single friend request matching a filter.
   */
  async findRequest(filter: AnyFilter) {
    return this.friendRequestModel.findOne(filter).exec();
  }

  /**
   * List friend requests with pagination and most recent first.
   */
  async listRequests(filter: AnyFilter, limit = 20, skip = 0) {
    return this.friendRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  }

  /**
   * Update the status of a friend request by its id.
   */
  async updateRequestStatus(id: Types.ObjectId, status: FriendRequest["status"]) {
    return this.friendRequestModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
  }

  // ---------- Friendship ----------

  /**
   * Create a friendship edge (userId -> friendId).
   * The unique index on (userId, friendId) prevents duplicates.
   */
  async createFriendship(userId: Types.ObjectId, friendId: Types.ObjectId) {
    const doc = new this.friendshipModel({ userId, friendId, since: new Date() });
    return doc.save();
  }

  /**
   * Remove a friendship edge (userId -> friendId).
   */
  async removeFriendship(userId: Types.ObjectId, friendId: Types.ObjectId) {
    return this.friendshipModel.findOneAndDelete({ userId, friendId }).exec();
  }

  /**
   * List friends (friendship edges) of a user with pagination.
   */
  async listFriends(userId: Types.ObjectId, limit = 20, skip = 0) {
    return this.friendshipModel
      .find({ userId })
      .sort({ since: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  }
}
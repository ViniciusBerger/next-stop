import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friends } from './schemas/friends.schema';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friends.name) private friendsModel: Model<Friends>,
  ) {}

  async addFriend(user1: string, user2: string) {
    const friend = new this.friendsModel({ user1, user2 });
    return friend.save();
  }

  async removeFriend(id: string) {
    const deleted = await this.friendsModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Friend not found');
    }
    return { message: 'Friend removed' };
  }

  async listFriends(user: string) {
    return this.friendsModel.find({
      $or: [{ user1: user }, { user2: user }],
    });
  }
}
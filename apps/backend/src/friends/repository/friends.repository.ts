import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from '../schema/friends.schema';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class FriendsRepository {

  constructor(
    @InjectModel(Friend.name) private model: Model<Friend>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  // Create friend request
  async create(data) {
    return this.model.create(data);
  }

  // Get accepted friends
 async getFriends(userId: string) {

  const friendships = await this.model.find({
    status: 'accepted',
    $or: [
      { requester: userId },   // ← plain string, no ObjectId
      { recipient: userId }
    ]
  }).lean();

  const friendIds = friendships.map((f: any) => {
    return f.requester.toString() === userId ? f.recipient : f.requester;
  });

  return await this.userModel.find({
    _id: { $in: friendIds.map(id => new Types.ObjectId(id)) }
  }).lean();

}
  // Get pending requests (with requester user data, excluding admins)
  async getRequests(userId: string) {
    const requests = await this.model.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester').lean();

    return requests.filter((r: any) => r.requester && r.requester.role !== 'admin');
  }

  // Suggestions (basic version, excluding admins)
  async getSuggestions(userId: string) {

const user = await this.userModel.findById(userId);

const friendIds = user?.friends || [];

const requests = await this.model.find({

$or:[
{ requester:userId },
{ recipient:userId }
]

});

const requestIds = requests.map(r =>

r.requester.toString() === userId
? r.recipient.toString()
: r.requester.toString()

);

return this.userModel.find({

_id:{
$nin:[
new Types.ObjectId(userId),
...friendIds.map(id=>new Types.ObjectId(id)),
...requestIds.map(id=>new Types.ObjectId(id))
]
},
role: { $ne: 'admin' }

}).limit(10).lean();

}
  // Get outgoing pending requests (with recipient user data, excluding admins)
  async getOutgoingRequests(userId: string) {
    const requests = await this.model.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient').lean();

    return requests.filter((r: any) => r.recipient && r.recipient.role !== 'admin');
  }

  // Add users to each other's friends array
  async addFriendToUsers(user1: string, user2: string) {
    await this.userModel.updateOne(
      { _id: user1 },
      { $addToSet: { friends: user2 } }
    );
    await this.userModel.updateOne(
      { _id: user2 },
      { $addToSet: { friends: user1 } }
    );
  }

  // Prevent duplicate requests
  async findExistingRequest(user1: string, user2: string) {
    return this.model.findOne({
      $or: [
        { requester: user1, recipient: user2 },
        { requester: user2, recipient: user1 }
      ]
    });
  }

  // Find request by id
  async findById(id: string) {
    return this.model.findById(id);
  }

  // Update request status
  async updateStatus(id: string, status: string) {
    return this.model.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
  }

  // Delete friendship/request
  async delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }

}
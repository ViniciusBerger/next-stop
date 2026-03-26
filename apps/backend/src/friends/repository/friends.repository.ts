import { Injectable }
from '@nestjs/common';

import { InjectModel }
from '@nestjs/mongoose';

import { Model }
from 'mongoose';

import { Friend }
from '../schema/friends.schema';

import { User }
from '../../user/schemas/user.schema';

@Injectable()

export class FriendsRepository{

constructor(

@InjectModel(Friend.name)
private model:Model<Friend>,

@InjectModel(User.name)
private userModel:Model<User>

){}


async create(data){

return this.model.create(data);

}


// Returns actual friends (users)
async getFriends(userId){

const requests = await this.model.find({

status:'accepted',

$or:[
{requester:userId},
{recipient:userId}
]

});

const friendIds = requests.map(r =>

r.requester.toString() === userId
? r.recipient
: r.requester

);

return this.userModel.find({

_id:{ $in:friendIds }

}).select("_id username email profile");

}


// Returns pending requests
async getRequests(userId){

return this.model.find({

recipient:userId,
status:'pending'

});

}


// Simple suggestions (can improve later)
async getSuggestions(userId){

return this.model.find({

requester:{$ne:userId},
recipient:{$ne:userId}

});

}


// Add users to each other's friend list
async addFriendToUsers(user1,user2){

await this.userModel.updateOne(
{_id:user1},
{$addToSet:{friends:user2}}
);

await this.userModel.updateOne(
{_id:user2},
{$addToSet:{friends:user1}}
);

}


// Prevent duplicate requests
async findExistingRequest(user1,user2){

return this.model.findOne({

$or:[
{requester:user1,recipient:user2},
{requester:user2,recipient:user1}
]

});

}


async findById(id){

return this.model.findById(id);

}


async updateStatus(id,status){

return this.model.findByIdAndUpdate(

id,

{
status,
updatedAt:new Date()
},

{new:true}

);

}


async delete(id){

return this.model.findByIdAndDelete(id);

}

}
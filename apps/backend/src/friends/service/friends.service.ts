import {
Injectable,
NotFoundException,
ConflictException
}
from '@nestjs/common';

import { FriendsRepository }
from '../repository/friends.repository';

import { NotificationService }
from '../../notifications/service/notification.service';

import { NotificationType }
from '../../notifications/schema/notification.schema';

@Injectable()

export class FriendsService{

constructor(
private repo:FriendsRepository,
private notificationService:NotificationService
){}


// Send friend request
async addFriend(dto){

// prevent duplicate requests
const existing =
await this.repo.findExistingRequest(
dto.requester,
dto.recipient
);

if(existing){

throw new ConflictException(
"Friend request already exists"
);

}

const request = await this.repo.create({

requester:dto.requester,
recipient:dto.recipient,
status:"pending"

});

await this.notificationService.create({
recipient: dto.recipient,
sender: dto.requester,
type: NotificationType.FRIEND_REQUEST,
message: 'sent you a friend request',
relatedId: request._id.toString(),
});

return request;

}


// Get accepted friends
async getFriends(userId:string){

return this.repo.getFriends(userId);

}


// Get pending requests
async getRequests(userId:string){

return this.repo.getRequests(userId);

}


// Suggestions (basic version)
async getSuggestions(userId:string){

return this.repo.getSuggestions(userId);

}


// Get outgoing pending requests
async getOutgoingRequests(userId:string){

return this.repo.getOutgoingRequests(userId);

}


// Accept / Decline request
async respond(dto){

const request =
await this.repo.findById(dto.requestId);

if(!request){

throw new NotFoundException(
"Request not found"
);

}

// update request status
const updated =
await this.repo.updateStatus(
dto.requestId,
dto.status
);



// add friendship if accepted
if(dto.status === "accepted"){

await this.repo.addFriendToUsers(
request.requester.toString(),
request.recipient.toString()
);

await this.notificationService.create({
recipient: request.requester.toString(),
sender: request.recipient.toString(),
type: NotificationType.FRIEND_ACCEPTED,
message: 'accepted your friend request',
relatedId: request._id.toString(),
});

}

return updated;

}


// Remove friendship
async remove(id){

return this.repo.delete(id);

}


// Unfriend by user IDs
async unfriend(userId: string, friendId: string){

return this.repo.unfriend(userId, friendId);

}

}
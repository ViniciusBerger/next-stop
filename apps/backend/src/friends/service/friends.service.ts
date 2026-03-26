import {
Injectable,
NotFoundException,
ConflictException
}
from '@nestjs/common';

import { FriendsRepository }
from '../repository/friends.repository';

@Injectable()

export class FriendsService{

constructor(
private repo:FriendsRepository
){}


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

return this.repo.create({

requester:dto.requester,
recipient:dto.recipient,
status:"pending"

});

}


async getFriends(userId){

return this.repo.getFriends(userId);

}


async getRequests(userId){

return this.repo.getRequests(userId);

}


async getSuggestions(userId){

return this.repo.getSuggestions(userId);

}


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
request.requester,
request.recipient
);

}

return updated;

}


async remove(id){

return this.repo.delete(id);

}

}
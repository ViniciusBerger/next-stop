import {

Controller,
Post,
Get,
Delete,
Body,
Query,
Param,
HttpCode,
UseGuards

}

from '@nestjs/common';

import { FriendsService }

from '../service/friends.service';

import { AddFriendDTO }

from '../DTOs/add.friend.DTO';

import { RespondFriendDTO }

from '../DTOs/respond.friend.DTO';

import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';

@Controller('friends')
@UseGuards(FirebaseAuthGuard)

export class FriendsController{

constructor(

private service:FriendsService

){}


@Post()

addFriend(

@Body() dto:AddFriendDTO

){

return this.service.addFriend(dto);

}


@Get()

getFriends(

@Query('userId') userId:string

){

return this.service.getFriends(userId);

}


@Get('requests')

getRequests(

@Query('userId') userId:string

){

return this.service.getRequests(userId);

}


@Get('suggestions')

getSuggestions(

@Query('userId') userId:string

){

return this.service.getSuggestions(userId);

}


@Get('outgoing')

getOutgoingRequests(

@Query('userId') userId:string

){

return this.service.getOutgoingRequests(userId);

}


@Post('respond')

respond(

@Body() dto:RespondFriendDTO

){

return this.service.respond(dto);

}


@Delete('unfriend')
@HttpCode(200)
unfriend(

@Query('userId') userId:string,
@Query('friendId') friendId:string

){

return this.service.unfriend(userId, friendId);

}


@Delete(':id')

remove(

@Param('id') id:string

){

return this.service.remove(id);

}

}
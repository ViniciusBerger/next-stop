import {

Controller,
Post,
Get,
Delete,
Body,
Query,
Param

}

from '@nestjs/common';

import { FriendsService }

from '../service/friends.service';

import { AddFriendDTO }

from '../DTOs/add.friend.DTO';

import { RespondFriendDTO }

from '../DTOs/respond.friend.DTO';

@Controller('friends')

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


@Post('respond')

respond(

@Body() dto:RespondFriendDTO

){

return this.service.respond(dto);

}


@Delete(':id')

remove(

@Param('id') id:string

){

return this.service.remove(id);

}

}
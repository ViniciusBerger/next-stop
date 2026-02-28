import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('add')
  addFriend(@Body() body: { user1: string; user2: string }) {
    return this.friendsService.addFriend(body.user1, body.user2);
  }

  @Delete('remove/:id')
  removeFriend(@Param('id') id: string) {
    return this.friendsService.removeFriend(id);
  }

  @Get()
  listFriends(@Body('user') user: string) {
    return this.friendsService.listFriends(user);
  }
}
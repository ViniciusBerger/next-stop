import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddFriendDto } from './dto/add-friend.dto';

@ApiTags('Friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {

  constructor(private readonly friendsService: FriendsService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add a new friend connection' })
  @ApiResponse({ status: 201, description: 'Friend added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  addFriend(@Body() body: AddFriendDto) {
    return this.friendsService.addFriend(body.user1, body.user2);
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Remove a friend' })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiResponse({ status: 404, description: 'Friend not found' })
  removeFriend(@Param('id') id: string) {
    return this.friendsService.removeFriend(id);
  }

  @Get()
  @ApiOperation({ summary: 'List friends of a user' })
  @ApiResponse({ status: 200, description: 'List of friends returned' })
  listFriends(@Query('user') user: string) {
    return this.friendsService.listFriends(user);
  }

}
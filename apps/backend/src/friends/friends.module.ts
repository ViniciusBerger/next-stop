import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  FriendRequest,
  friendRequestSchema,
} from "./schemas/friend-request.schema";
import {
  Friendship,
  friendshipSchema,
} from "./schemas/friendship.schema";
import { FriendsRepository } from "./friends.repository";
import { FriendsService } from "./service/friends.service";
import { FriendsController } from "./controller/friends.controller";
import { User, userSchema } from "../user/schemas/user.schema";

/**
 * FriendsModule
 *
 * Repository + models + service + controller.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: friendRequestSchema },
      { name: Friendship.name, schema: friendshipSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsRepository, FriendsService],
  exports: [FriendsRepository, FriendsService],
})
export class FriendsModule {}
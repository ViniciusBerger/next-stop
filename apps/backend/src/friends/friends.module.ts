import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friends, FriendsSchema } from './schemas/friends.schema';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friends.name, schema: FriendsSchema },
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
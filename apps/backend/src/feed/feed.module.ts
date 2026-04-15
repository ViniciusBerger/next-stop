import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, reviewSchema } from '../reviews/schema/review.schema';
import { Event, eventSchema } from '../events/schema/event.schema';
import { User, userSchema } from '../user/schemas/user.schema';
import { FriendsModule } from '../friends/friends.module';
import { FeedController } from './controller/feed.controller';
import { FeedService } from './service/feed.service';

@Module({
  imports: [
    FriendsModule,
    MongooseModule.forFeature([
      { name: Review.name, schema: reviewSchema },
      { name: Event.name, schema: eventSchema },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}

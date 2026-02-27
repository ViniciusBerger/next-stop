import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BadgeController } from './controller/badge.controller';
import { BadgeService } from './service/badge.service';
import { BadgeRepository } from './repository/badge.repository';
import { BadgeCheckerService } from './checker/badge-checker.service';
import { Badge, badgeSchema } from './schemas/badges.schema';
import { User, userSchema } from '../user/user.schema';
import { Review, reviewSchema } from '../reviews/schema/review.schema';
import { Event, eventSchema } from '../events/schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Badge.name, schema: badgeSchema },
      { name: User.name, schema: userSchema },
      { name: Review.name, schema: reviewSchema },
      { name: Event.name, schema: eventSchema },
    ]),
  ],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeRepository, BadgeCheckerService],
  exports: [BadgeService, BadgeCheckerService], // ← Export BadgeCheckerService
})
export class BadgeModule {}
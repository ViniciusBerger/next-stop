import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { FeedService } from '../service/feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Returns an aggregated activity feed for the given user.
   * GET /feed?userId=xxx
   */
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getFeed(@Query('userId') userId: string) {
    return this.feedService.getFeed(userId);
  }
}

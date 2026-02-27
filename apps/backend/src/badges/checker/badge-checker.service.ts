import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/user.schema';
import { Badge } from '../schemas/badges.schema';
import { Review } from '../../reviews/schema/review.schema';
import { Event } from '../../events/schema/event.schema';

@Injectable()
export class BadgeCheckerService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  /**
   * Awards a badge to a user if they don't already have it
   */
  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    const badge = await this.badgeModel.findOne({ badgeId });

    if (!user || !badge) {
      return false;
    }

    // Check if user already has this badge
    const alreadyHas = user.badges.some(
      (b: any) => b.badge.toString() === badge._id.toString()
    );

    if (alreadyHas) {
      return false;
    }

    // Award the badge
    user.badges.push({
      badge: badge._id,
      earnedAt: new Date(),
    } as any);

    await user.save();

    // Increment badge counter
    badge.totalAwarded += 1;
    await badge.save();

    return true;
  }

  /**
   * Check and award CONTRIBUTION badges after creating a review
   */
  async checkReviewBadges(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) return;

    // THE CRITIC: Review with 100+ words
    if (review.reviewText && review.reviewText.split(' ').length >= 100) {
      await this.awardBadge(userId, 'the-critic');
    }

    // PAPARAZZI: Photo in 10 different reviews
    const reviewsWithPhotos = await this.reviewModel.countDocuments({
      author: userId,
      images: { $exists: true, $not: { $size: 0 } },
    });

    if (reviewsWithPhotos >= 10) {
      await this.awardBadge(userId, 'paparazzi');
    }

    // FRESH PERSPECTIVE REVIEWER: First to review a place
    const placeReviewCount = await this.reviewModel.countDocuments({
      place: review.place,
    });

    if (placeReviewCount === 1) {
      await this.awardBadge(userId, 'fresh-perspective-reviewer');
    }

    // FRESH PERSPECTIVE EXPLORER: Reviewed 5 places with 0 previous reviews
    const firstReviewCount = await this.reviewModel.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$place', firstReview: { $min: '$createdAt' } } },
      { $count: 'total' },
    ]);

    if (firstReviewCount.length > 0 && firstReviewCount[0].total >= 5) {
      await this.awardBadge(userId, 'fresh-perspective-explorer');
    }

    // CAFFEINE ADDICT: Reviewed 5 different cafes
    const cafeReviews = await this.reviewModel.aggregate([
      { $match: { author: userId } },
      {
        $lookup: {
          from: 'Place',
          localField: 'place',
          foreignField: '_id',
          as: 'placeData',
        },
      },
      { $unwind: '$placeData' },
      { $match: { 'placeData.category': 'Cafe' } },
      { $group: { _id: '$place' } },
      { $count: 'total' },
    ]);

    if (cafeReviews.length > 0 && cafeReviews[0].total >= 5) {
      await this.awardBadge(userId, 'caffeine-addict');
    }
  }

  /**
   * Check and award badge when a review gets liked
   */
  async checkReviewLikeBadges(reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) return;

    // VIBE CHECK: Review liked by 20+ users
    if (review.likes >= 20) {
      await this.awardBadge(review.author.toString(), 'vibe-check');
    }
  }

  /**
   * Check and award EVENT badges after attending/creating events
   */
  async checkEventBadges(userId: string): Promise<void> {
    // SOCIAL BUTTERFLY: Attended 3+ events
    const attendedEvents = await this.eventModel.countDocuments({
      attendees: userId,
      status: 'completed',
    });

    if (attendedEvents >= 3) {
      await this.awardBadge(userId, 'social-butterfly');
    }

    // REGULAR BADGES (Bronze, Silver, Gold)
    if (attendedEvents >= 10) await this.awardBadge(userId, 'regular-bronze');
    if (attendedEvents >= 50) await this.awardBadge(userId, 'regular-silver');
    if (attendedEvents >= 100) await this.awardBadge(userId, 'regular-gold');

    // TRENDSETTER: 10+ people attended event created by user
    const createdEvents = await this.eventModel.find({
      host: userId,
      status: 'completed',
    });

    for (const event of createdEvents) {
      if (event.attendees.length >= 10) {
        await this.awardBadge(userId, 'trendsetter');
        break;
      }
    }

    // NIGHT OWL: Attended 3+ events after 10 PM
    const nightEvents = await this.eventModel.countDocuments({
      attendees: userId,
      status: 'completed',
      $expr: { $gte: [{ $hour: '$date' }, 22] },
    });

    if (nightEvents >= 3) {
      await this.awardBadge(userId, 'night-owl');
    }

    // WEEKEND WARRIOR (COMPLEX): Event every Saturday for 4 consecutive weeks
    await this.checkWeekendWarrior(userId);

    // MONTHLY STREAK (COMPLEX): Event in 6 consecutive months
    await this.checkMonthlyStreak(userId);

    // INNER CIRCLE (SIMPLE): At least 3 friends who each appeared in 5+ events
    await this.checkInnerCircle(userId);
  }

  /**
   * WEEKEND WARRIOR (COMPLEX): Event every Saturday for 4 consecutive weeks
   */
  private async checkWeekendWarrior(userId: string): Promise<void> {
    const events = await this.eventModel
      .find({
        attendees: userId,
        status: 'completed',
        $expr: { $eq: [{ $dayOfWeek: '$date' }, 7] }, // Saturday only (7 = Saturday in MongoDB)
      })
      .sort({ date: 1 })
      .lean();

    if (events.length < 4) return;

    let consecutiveSaturdays = 0;
    let lastSaturday: Date | null = null;

    for (const event of events) {
      const eventDate = new Date(event.date);

      if (!lastSaturday) {
        consecutiveSaturdays = 1;
        lastSaturday = eventDate;
        continue;
      }

      // Calculate days difference
      const daysDiff = Math.floor(
        (eventDate.getTime() - lastSaturday.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 7) {
        // Consecutive Saturday (exactly 7 days)
        consecutiveSaturdays++;

        if (consecutiveSaturdays >= 4) {
          await this.awardBadge(userId, 'weekend-warrior');
          return;
        }
      } else if (daysDiff > 7) {
        // Missed a Saturday - reset counter
        consecutiveSaturdays = 1;
      }
      // If daysDiff < 7, it's the same Saturday or error - ignore

      lastSaturday = eventDate;
    }
  }

  /**
   * MONTHLY STREAK (COMPLEX): Event in 6 consecutive months
   */
  private async checkMonthlyStreak(userId: string): Promise<void> {
    const events = await this.eventModel
      .find({ attendees: userId, status: 'completed' })
      .sort({ date: 1 })
      .lean();

    if (events.length < 6) return;

    // Group events by year-month
    const monthsSet = new Set<string>();

    for (const event of events) {
      const date = new Date(event.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(yearMonth);
    }

    // Convert to sorted array
    const months = Array.from(monthsSet).sort();

    if (months.length < 6) return;

    // Check for 6 consecutive months
    let consecutiveMonths = 1;

    for (let i = 1; i < months.length; i++) {
      const [prevYear, prevMonth] = months[i - 1].split('-').map(Number);
      const [currYear, currMonth] = months[i].split('-').map(Number);

      let isConsecutive = false;

      if (currYear === prevYear && currMonth === prevMonth + 1) {
        // Same year, next month
        isConsecutive = true;
      } else if (currYear === prevYear + 1 && prevMonth === 12 && currMonth === 1) {
        // Year transition (Dec -> Jan)
        isConsecutive = true;
      }

      if (isConsecutive) {
        consecutiveMonths++;

        if (consecutiveMonths >= 6) {
          await this.awardBadge(userId, 'monthly-streak');
          return;
        }
      } else {
        // Not consecutive - reset counter
        consecutiveMonths = 1;
      }
    }
  }

  /**
   * INNER CIRCLE (SIMPLE): At least 3 friends who each appeared in 5+ events
   */
  private async checkInnerCircle(userId: string): Promise<void> {
    const events = await this.eventModel
      .find({ attendees: userId, status: 'completed' })
      .select('attendees')
      .lean();

    if (events.length < 5) return;

    // Count how many times each friend appeared
    const friendCount: Record<string, number> = {};

    for (const event of events) {
      for (const attendee of event.attendees) {
        const attendeeId = attendee.toString();
        if (attendeeId !== userId) {
          friendCount[attendeeId] = (friendCount[attendeeId] || 0) + 1;
        }
      }
    }

    // Check if at least 3 friends appeared in 5+ events
    const frequentFriends = Object.values(friendCount).filter(count => count >= 5);

    if (frequentFriends.length >= 3) {
      await this.awardBadge(userId, 'inner-circle');
    }
  }

  /**
   * Manual check - run all badge checks for a user
   */
  async checkAllBadges(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    // Check review badges
    const userReviews = await this.reviewModel.find({ author: userId });
    for (const review of userReviews) {
      await this.checkReviewBadges(userId, review._id.toString());
    }

    // Check event badges
    await this.checkEventBadges(userId);

    return awarded;
  }
}
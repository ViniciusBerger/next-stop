import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
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

  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    const badge = await this.badgeModel.findOne({ badgeId });

    if (!user || !badge) return false;

    const alreadyHas = user.badges.some(
      (b: any) => b.badge.toString() === badge._id.toString()
    );

    if (alreadyHas) return false;

    user.badges.push({ badge: badge._id, earnedAt: new Date() } as any);
    await user.save();

    badge.totalAwarded += 1;
    await badge.save();

    return true;
  }

  async checkReviewBadges(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) return;

    const userObjectId = new Types.ObjectId(userId); // 👈 ADDED

    // THE CRITIC: Review with 100+ words
    if (review.reviewText && review.reviewText.split(' ').length >= 100) {
      await this.awardBadge(userId, 'the-critic');
    }

    // PAPARAZZI: Photo in 10 different reviews
    const reviewsWithPhotos = await this.reviewModel.countDocuments({
      author: userObjectId, // 👈 FIXED
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
      { $match: { author: userObjectId } }, // 👈 FIXED
      { $group: { _id: '$place', firstReview: { $min: '$createdAt' } } },
      { $count: 'total' },
    ]);

    if (firstReviewCount.length > 0 && firstReviewCount[0].total >= 5) {
      await this.awardBadge(userId, 'fresh-perspective-explorer');
    }

    // CAFFEINE ADDICT: Reviewed 5 different cafes
    const cafeReviews = await this.reviewModel.aggregate([
      { $match: { author: userObjectId } }, // 👈 FIXED
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

  async checkReviewLikeBadges(reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) return;

    if (review.likes >= 20) {
      await this.awardBadge(review.author.toString(), 'vibe-check');
    }
  }

  async checkEventBadges(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId); // 👈 ADDED

    const attendedEvents = await this.eventModel.countDocuments({
      attendees: userObjectId, // 👈 FIXED
      status: 'completed',
    });

    if (attendedEvents >= 3) await this.awardBadge(userId, 'social-butterfly');
    if (attendedEvents >= 10) await this.awardBadge(userId, 'regular-bronze');
    if (attendedEvents >= 50) await this.awardBadge(userId, 'regular-silver');
    if (attendedEvents >= 100) await this.awardBadge(userId, 'regular-gold');

    const createdEvents = await this.eventModel.find({
      host: userObjectId, // 👈 FIXED
      status: 'completed',
    });

    for (const event of createdEvents) {
      if (event.attendees.length >= 10) {
        await this.awardBadge(userId, 'trendsetter');
        break;
      }
    }

    const nightEvents = await this.eventModel.countDocuments({
      attendees: userObjectId, // 👈 FIXED
      status: 'completed',
      $expr: { $gte: [{ $hour: '$date' }, 22] },
    });

    if (nightEvents >= 3) await this.awardBadge(userId, 'night-owl');

    await this.checkWeekendWarrior(userId);
    await this.checkMonthlyStreak(userId);
    await this.checkInnerCircle(userId);
  }

  private async checkWeekendWarrior(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId); // 👈 ADDED

    const events = await this.eventModel
      .find({
        attendees: userObjectId, // 👈 FIXED
        status: 'completed',
        $expr: { $eq: [{ $dayOfWeek: '$date' }, 7] },
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

      const daysDiff = Math.floor(
        (eventDate.getTime() - lastSaturday.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 7) {
        consecutiveSaturdays++;
        if (consecutiveSaturdays >= 4) {
          await this.awardBadge(userId, 'weekend-warrior');
          return;
        }
      } else if (daysDiff > 7) {
        consecutiveSaturdays = 1;
      }

      lastSaturday = eventDate;
    }
  }

  private async checkMonthlyStreak(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId); // 👈 ADDED

    const events = await this.eventModel
      .find({ attendees: userObjectId, status: 'completed' }) // 👈 FIXED
      .sort({ date: 1 })
      .lean();

    if (events.length < 6) return;

    const monthsSet = new Set<string>();

    for (const event of events) {
      const date = new Date(event.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(yearMonth);
    }

    const months = Array.from(monthsSet).sort();
    if (months.length < 6) return;

    let consecutiveMonths = 1;

    for (let i = 1; i < months.length; i++) {
      const [prevYear, prevMonth] = months[i - 1].split('-').map(Number);
      const [currYear, currMonth] = months[i].split('-').map(Number);

      let isConsecutive = false;

      if (currYear === prevYear && currMonth === prevMonth + 1) {
        isConsecutive = true;
      } else if (currYear === prevYear + 1 && prevMonth === 12 && currMonth === 1) {
        isConsecutive = true;
      }

      if (isConsecutive) {
        consecutiveMonths++;
        if (consecutiveMonths >= 6) {
          await this.awardBadge(userId, 'monthly-streak');
          return;
        }
      } else {
        consecutiveMonths = 1;
      }
    }
  }

  private async checkInnerCircle(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId); // 👈 ADDED

    const events = await this.eventModel
      .find({ attendees: userObjectId, status: 'completed' }) // 👈 FIXED
      .select('attendees')
      .lean();

    if (events.length < 5) return;

    const friendCount: Record<string, number> = {};

    for (const event of events) {
      for (const attendee of event.attendees) {
        const attendeeId = attendee.toString();
        if (attendeeId !== userId) {
          friendCount[attendeeId] = (friendCount[attendeeId] || 0) + 1;
        }
      }
    }

    const frequentFriends = Object.values(friendCount).filter(count => count >= 5);

    if (frequentFriends.length >= 3) {
      await this.awardBadge(userId, 'inner-circle');
    }
  }

  async checkAllBadges(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    // 👇 FIXED - convert userId to ObjectId for proper MongoDB query
    const userReviews = await this.reviewModel.find({ 
      author: new Types.ObjectId(userId) 
    });

    for (const review of userReviews) {
      await this.checkReviewBadges(userId, review._id.toString());
    }

    await this.checkEventBadges(userId);

    return awarded;
  }
}
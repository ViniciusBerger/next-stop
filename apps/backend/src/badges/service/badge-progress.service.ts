import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Badge } from '../schemas/badges.schema';
import { Review } from '../../reviews/schema/review.schema';
import { Event } from '../../events/schema/event.schema';

@Injectable()
export class BadgeProgressService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  /**
   * Get all badges with earned status + progress for a user
   */
  async getBadgesWithProgress(userId: string): Promise<any[]> {
    const [allBadges, user] = await Promise.all([
      this.badgeModel.find().sort({ category: 1, name: 1 }).lean(),
      this.userModel.findById(userId).lean(),
    ]);

    if (!user) return [];

    // Get user's earned badge IDs
    const earnedMap = new Map<string, Date>();
    for (const ub of user.badges || []) {
      earnedMap.set(ub.badge.toString(), ub.earnedAt);
    }

    // Get progress data once
    const [
      attendedEvents,
      reviewsWithPhotos,
      cafeReviews,
      nightEvents,
      userReviews,
      createdEvents,
    ] = await Promise.all([
      // Total attended events
      this.eventModel.countDocuments({
        attendees: userId,
        status: 'completed',
      }),
      // Reviews with photos
      this.reviewModel.countDocuments({
        author: userId,
        images: { $exists: true, $not: { $size: 0 } },
      }),
      // Cafe reviews
      this.reviewModel.aggregate([
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
      ]),
      // Night events
      this.eventModel.countDocuments({
        attendees: userId,
        status: 'completed',
        $expr: { $gte: [{ $hour: '$date' }, 22] },
      }),
      // User reviews
      this.reviewModel.find({ author: userId }).lean(),
      // Created events
      this.eventModel.find({ host: userId, status: 'completed' }).lean(),
    ]);

    // Max attendees in a created event (for trendsetter)
    const maxAttendees = createdEvents.length > 0
      ? Math.max(...createdEvents.map((e: any) => e.attendees?.length || 0))
      : 0;

    // Reviews with 100+ words (for the-critic)
    const longReviews = userReviews.filter(
      (r: any) => r.reviewText && r.reviewText.split(' ').length >= 100
    ).length;

    // Cafe count
    const cafeCount = cafeReviews.length > 0 ? cafeReviews[0].total : 0;

    // Monthly streak progress
    const monthlyStreakProgress = await this.getMonthlyStreakProgress(userId);

    // Weekend warrior progress
    const weekendWarriorProgress = await this.getWeekendWarriorProgress(userId);

    // Inner circle progress
    const innerCircleProgress = await this.getInnerCircleProgress(userId);

    // Fresh perspective explorer
    const firstReviewCount = await this.reviewModel.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$place', firstReview: { $min: '$createdAt' } } },
      { $count: 'total' },
    ]);
    const freshExplorerCount = firstReviewCount.length > 0 ? firstReviewCount[0].total : 0;

    // Progress map per badgeId
    const progressMap: Record<string, { current: number; target: number }> = {
      'social-butterfly':       { current: Math.min(attendedEvents, 3), target: 3 },
      'regular-bronze':         { current: Math.min(attendedEvents, 10), target: 10 },
      'regular-silver':         { current: Math.min(attendedEvents, 50), target: 50 },
      'regular-gold':           { current: Math.min(attendedEvents, 100), target: 100 },
      'trendsetter':            { current: Math.min(maxAttendees, 10), target: 10 },
      'night-owl':              { current: Math.min(nightEvents, 3), target: 3 },
      'paparazzi':              { current: Math.min(reviewsWithPhotos, 10), target: 10 },
      'the-critic':             { current: Math.min(longReviews, 1), target: 1 },
      'caffeine-addict':        { current: Math.min(cafeCount, 5), target: 5 },
      'fresh-perspective-explorer': { current: Math.min(freshExplorerCount, 5), target: 5 },
      'fresh-perspective-reviewer': { current: Math.min(freshExplorerCount, 1), target: 1 },
      'monthly-streak':         { current: monthlyStreakProgress, target: 6 },
      'weekend-warrior':        { current: weekendWarriorProgress, target: 4 },
      'inner-circle':           { current: innerCircleProgress, target: 3 },
      'vibe-check':             { current: 0, target: 20 }, // needs review likes data
    };

    // Build response
    return allBadges.map((badge: any) => {
      const earned = earnedMap.has(badge._id.toString());
      const earnedAt = earned ? earnedMap.get(badge._id.toString()) : undefined;
      const progress = progressMap[badge.badgeId] || { current: 0, target: 1 };

      return {
        ...badge,
        earned,
        earnedAt,
        progress,
      };
    });
  }

  private async getMonthlyStreakProgress(userId: string): Promise<number> {
    const events = await this.eventModel
      .find({ attendees: userId, status: 'completed' })
      .sort({ date: 1 })
      .lean();

    if (events.length === 0) return 0;

    const monthsSet = new Set<string>();
    for (const event of events) {
      const date = new Date(event.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(yearMonth);
    }

    const months = Array.from(monthsSet).sort();
    let maxConsecutive = 1;
    let consecutive = 1;

    for (let i = 1; i < months.length; i++) {
      const [prevYear, prevMonth] = months[i - 1].split('-').map(Number);
      const [currYear, currMonth] = months[i].split('-').map(Number);

      const isConsecutive =
        (currYear === prevYear && currMonth === prevMonth + 1) ||
        (currYear === prevYear + 1 && prevMonth === 12 && currMonth === 1);

      if (isConsecutive) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 1;
      }
    }

    return Math.min(maxConsecutive, 6);
  }

  private async getWeekendWarriorProgress(userId: string): Promise<number> {
    const events = await this.eventModel
      .find({
        attendees: userId,
        status: 'completed',
        $expr: { $eq: [{ $dayOfWeek: '$date' }, 7] },
      })
      .sort({ date: 1 })
      .lean();

    if (events.length === 0) return 0;

    let maxConsecutive = 1;
    let consecutive = 1;
    let lastDate: Date | null = null;

    for (const event of events) {
      const eventDate = new Date(event.date);
      if (!lastDate) { lastDate = eventDate; continue; }

      const daysDiff = Math.floor(
        (eventDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 7) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else if (daysDiff > 7) {
        consecutive = 1;
      }

      lastDate = eventDate;
    }

    return Math.min(maxConsecutive, 4);
  }

  private async getInnerCircleProgress(userId: string): Promise<number> {
    const events = await this.eventModel
      .find({ attendees: userId, status: 'completed' })
      .select('attendees')
      .lean();

    if (events.length === 0) return 0;

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
    return Math.min(frequentFriends.length, 3);
  }
}
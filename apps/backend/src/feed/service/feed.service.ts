import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '../../reviews/schema/review.schema';
import { Event } from '../../events/schema/event.schema';
import { User } from '../../user/schemas/user.schema';
import { FriendsService } from '../../friends/service/friends.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly friendsService: FriendsService,
  ) {}

  /**
   * Check if an actor's activity is visible to the viewer.
   * @param privacySetting - The actor's privacy value ('All', 'Friends', 'None', or undefined)
   * @param isFriend - Whether the viewer is a friend of the actor
   */
  private isVisible(
    privacySetting: string | undefined,
    isFriend: boolean,
  ): boolean {
    if (!privacySetting) return true; // No setting = visible by default
    if (privacySetting === 'None') return false;
    if (privacySetting === 'Friends') return isFriend;
    return true; // 'All' or any other value
  }

  async getFeed(userId: string) {
    // Step A: Get prerequisites in parallel
    const [friends, user] = await Promise.all([
      this.friendsService.getFriends(userId),
      this.userModel.findById(userId).exec(),
    ]);

    if (!user) return [];

    const friendIds = (friends as any[]).map((f: any) => f._id.toString());
    const favoritePlaceIds = [
      ...(user.favorites || []),
      ...(user.wishlist || []),
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    // Step B: Run 4 feed queries in parallel
    const [friendReviews, publicEvents, friendVisits, favoriteReviews] =
      await Promise.all([
        // Query A: Friend reviews (last 30 days)
        friendIds.length > 0
          ? this.reviewModel
              .find({
                author: { $in: friendIds },
                createdAt: { $gte: thirtyDaysAgo },
              })
              .populate('author', 'username profile')
              .populate('place', 'name address category')
              .sort({ createdAt: -1 })
              .limit(10)
              .lean()
          : Promise.resolve([]),

        // Query B: Public upcoming events + friend-hosted events
        this.eventModel
          .find({
            date: { $gte: now },
            $or: [
              { privacy: 'Public Event' },
              ...(friendIds.length > 0
                ? [{ host: { $in: friendIds } }]
                : []),
            ],
          })
          .populate('host', 'username profile')
          .populate('place', 'name address category')
          .populate('attendees', '_id')
          .populate('invitedFriends', '_id')
          .sort({ date: 1 })
          .limit(10)
          .lean(),

        // Query C: Friend past event attendance (visits)
        friendIds.length > 0
          ? this.eventModel
              .find({
                attendees: { $in: friendIds },
                date: { $lt: now },
              })
              .populate('host', 'username profile')
              .populate('place', 'name address category')
              .populate('attendees', 'username profile')
              .sort({ date: -1 })
              .limit(10)
              .lean()
          : Promise.resolve([]),

        // Query D: Reviews on user's favorite/wishlist places
        favoritePlaceIds.length > 0
          ? this.reviewModel
              .find({
                place: { $in: favoritePlaceIds },
                author: { $ne: new Types.ObjectId(userId) },
                createdAt: { $gte: thirtyDaysAgo },
              })
              .populate('author', 'username profile')
              .populate('place', 'name address category')
              .sort({ createdAt: -1 })
              .limit(10)
              .lean()
          : Promise.resolve([]),
      ]);

    // Step C: Transform into unified feed items
    const feedItems: any[] = [];

    // Track friend review IDs to deduplicate against favorite_review
    const friendReviewAuthorPlaceKeys = new Set<string>();

    // Transform friend_review items
    for (const review of friendReviews as any[]) {
      const authorId = review.author?._id?.toString();
      const placeId = review.place?._id?.toString();
      if (!authorId || !placeId) continue;

      // Privacy: author is a friend, check their activityFeed setting
      const activityPrivacy = review.author.profile?.privacy?.activityFeed;
      if (!this.isVisible(activityPrivacy, true)) continue;

      friendReviewAuthorPlaceKeys.add(`${authorId}_${placeId}`);

      feedItems.push({
        id: review._id.toString(),
        type: 'friend_review',
        actor: {
          _id: authorId,
          username: review.author.username,
          profilePicture: review.author.profile?.profilePicture || null,
        },
        activityText: `${review.author.username} reviewed ${review.place.name}`,
        place: {
          _id: placeId,
          name: review.place.name,
          address: review.place.address,
          category: review.place.category,
        },
        rating: review.rating,
        reviewText: review.reviewText,
        images: review.images || [],
        likes: review.likes || 0,
        likedBy: (review.likedBy || []).map((id: any) => id.toString()),
        eventName: null,
        eventDate: null,
        eventId: null,
        attendeeCount: null,
        privacy: null,
        timestamp: review.createdAt,
      });
    }

    // Transform event items
    for (const event of publicEvents as any[]) {
      if (!event.host || !event.place) continue;
      const hostId = event.host._id?.toString();

      // Privacy: check host's myEvents setting
      const hostIsFriend = friendIds.includes(hostId);
      const myEventsPrivacy = event.host.profile?.privacy?.myEvents;
      if (!this.isVisible(myEventsPrivacy, hostIsFriend)) continue;

      // Determine if viewer can access this event (host, attendee, or invited)
      const isViewerHost = hostId === userId;
      const isViewerAttending = (event.attendees || []).some(
        (a: any) => a?._id?.toString() === userId,
      );
      const isViewerInvited = (event.invitedFriends || []).some(
        (f: any) => f?._id?.toString() === userId,
      );
      const canView =
        event.privacy === 'Public Event' ||
        isViewerHost ||
        isViewerAttending ||
        isViewerInvited;

      feedItems.push({
        id: event._id.toString(),
        type: 'event',
        actor: {
          _id: hostId,
          username: event.host.username,
          profilePicture: event.host.profile?.profilePicture || null,
        },
        activityText: friendIds.includes(hostId)
          ? canView
            ? `${event.host.username} is hosting ${event.name}`
            : `${event.host.username} is hosting a private event`
          : `Upcoming event: ${event.name}`,
        place: canView
          ? {
              _id: event.place._id?.toString(),
              name: event.place.name,
              address: event.place.address,
              category: event.place.category || '',
            }
          : { _id: '', name: '', address: '', category: '' },
        rating: null,
        reviewText: null,
        images: [],
        likes: null,
        likedBy: [],
        eventName: canView ? event.name : null,
        eventDate: canView ? event.date : null,
        eventId: event._id.toString(),
        attendeeCount: canView ? event.attendees?.length || 0 : null,
        privacy: event.privacy,
        canView,
        timestamp: event.createdAt,
      });
    }

    // Transform visit items — one item per friend-attendee
    for (const event of friendVisits as any[]) {
      if (!event.place) continue;
      const attendees = event.attendees || [];
      const friendAttendees = attendees.filter((a: any) =>
        friendIds.includes(a._id?.toString()),
      );

      for (const attendee of friendAttendees) {
        // Privacy: check attendee's activityFeed setting (they are a friend)
        const attendeePrivacy = attendee.profile?.privacy?.activityFeed;
        if (!this.isVisible(attendeePrivacy, true)) continue;

        feedItems.push({
          id: `${event._id.toString()}_${attendee._id.toString()}`,
          type: 'visit',
          actor: {
            _id: attendee._id.toString(),
            username: attendee.username,
            profilePicture: attendee.profile?.profilePicture || null,
          },
          activityText: `${attendee.username} visited ${event.place.name}`,
          place: {
            _id: event.place._id?.toString(),
            name: event.place.name,
            address: event.place.address,
            category: event.place.category || '',
          },
          rating: null,
          reviewText: null,
          images: [],
          likes: null,
          likedBy: [],
          eventName: event.name,
          eventDate: event.date,
          eventId: event._id.toString(),
          attendeeCount: attendees.length,
          privacy: null,
          timestamp: event.date,
        });
      }
    }

    // Transform favorite_review items (skip duplicates from friend reviews)
    for (const review of favoriteReviews as any[]) {
      const authorId = review.author?._id?.toString();
      const placeId = review.place?._id?.toString();
      if (!authorId || !placeId) continue;

      // Skip if this author+place combo was already added as a friend_review
      if (friendReviewAuthorPlaceKeys.has(`${authorId}_${placeId}`)) continue;

      // Privacy: check author's activityFeed setting (they are NOT necessarily a friend)
      const isFriend = friendIds.includes(authorId);
      const authorPrivacy = review.author.profile?.privacy?.activityFeed;
      if (!this.isVisible(authorPrivacy, isFriend)) continue;

      feedItems.push({
        id: review._id.toString(),
        type: 'favorite_review',
        actor: {
          _id: authorId,
          username: review.author.username,
          profilePicture: review.author.profile?.profilePicture || null,
        },
        activityText: `${review.author.username} reviewed ${review.place.name}`,
        place: {
          _id: placeId,
          name: review.place.name,
          address: review.place.address,
          category: review.place.category,
        },
        rating: review.rating,
        reviewText: review.reviewText,
        images: review.images || [],
        likes: review.likes || 0,
        likedBy: (review.likedBy || []).map((id: any) => id.toString()),
        eventName: null,
        eventDate: null,
        eventId: null,
        attendeeCount: null,
        privacy: null,
        timestamp: review.createdAt,
      });
    }

    // Step D: Sort by timestamp descending, return top 20
    feedItems.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return feedItems.slice(0, 20);
  }
}

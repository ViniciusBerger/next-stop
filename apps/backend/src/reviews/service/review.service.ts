import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository';
import { Review } from '../schema/review.schema';
import { CreateReviewDTO } from '../DTOs/create.review.DTO';
import { GetReviewDTO } from '../DTOs/get.review.DTO';
import { LikeReviewDTO } from '../DTOs/like.review.DTO';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>
  ) {}

  /**
   * Creates a new review
   * After creation, updates Place's rating
   */
  async createReview(dto: CreateReviewDTO): Promise<Review> {
    const newReview = await this.reviewRepository.create(dto as any);

    // After creating review, update Place's rating
    await this.updatePlaceRating(dto.place);

    // Populate before returning
    return await this.reviewModel
      .findById(newReview._id)
      .populate('author', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('event', 'name date')
      .exec() as Review;
  }

  /**
   * Retrieves all reviews with optional filters
   */
  async getAllReviews(dto?: GetReviewDTO): Promise<Review[]> {
    const filter: any = {};

    if (dto) {
      if (dto.author) filter.author = dto.author;
      if (dto.place) filter.place = dto.place;
      if (dto.event) filter.event = dto.event;
    }

    // Get reviews from repository then populate
    const reviews = await this.reviewRepository.findMany(filter);
    
    return await this.reviewModel
      .find({ _id: { $in: reviews.map(r => r._id) } })
      .populate('author', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('event', 'name date')
      .populate('likedBy', 'username profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retrieves a specific review by ID
   */
  async getReview(dto: GetReviewDTO): Promise<Review> {
    const { id } = dto;

    if (!id) {
      throw new BadRequestException('Please provide a review ID');
    }

    const review = await this.reviewModel
      .findById(id)
      .populate('author', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('event', 'name date')
      .populate('likedBy', 'username profilePicture')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Retrieves all reviews for a specific place
   */
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ place: placeId })
      .populate('author', 'username profilePicture')
      .populate('event', 'name date')
      .populate('likedBy', 'username profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retrieves all reviews by a specific user (History)
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ author: userId })
      .populate('place', 'name address category customImages')
      .populate('event', 'name date')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
 * Deletes a review (author or admin only)
 */
async deleteReview(
  reviewId: string, 
  userId: string, 
  userRole?: string
): Promise<{ deleted: boolean; message: string }> {
  // Search review first so the author is checked
  const review = await this.reviewRepository.findById(reviewId);

  if (!review) {
    throw new NotFoundException('Review not found');
  }

  // Admin can delete any review, authors can delete their own reviews only.
  const isAdmin = userRole === 'admin';
  const isAuthor = review.author.toString() === userId;

  if (!isAdmin && !isAuthor) {
    throw new ForbiddenException('You can only delete your own reviews');
  }

  // Delete a review
  await this.reviewRepository.delete({ _id: reviewId });

  return {
    deleted: true,
    message: isAdmin 
      ? 'Review deleted by admin successfully' 
      : 'Review deleted successfully',
  };
}

  /**
   * Toggles like on a review
   */
  async toggleLike(dto: LikeReviewDTO): Promise<Review> {
    const { reviewId, userId } = dto;

    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already liked
    const userIndex = review.likedBy.findIndex(
      (id) => id.toString() === userId.toString(),
    );

    if (userIndex > -1) {
      review.likedBy.splice(userIndex, 1);
      review.likes = Math.max(0, review.likes - 1);
    } else {
      review.likedBy.push(userId as any);
      review.likes += 1;
    }

    const saved = await this.reviewRepository.save(review);

    // Populate before returning
    return await this.reviewModel
      .findById(saved._id)
      .populate('author', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('likedBy', 'username profilePicture')
      .exec() as Review;
  }

  /**
   * Helper method to update Place's average rating
   */
  private async updatePlaceRating(placeId: string): Promise<void> {
    const reviews = await this.reviewRepository.findMany({ place: placeId });

    if (reviews.length === 0) {
      console.log(`Place ${placeId} - No reviews, should reset to 0`);
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    console.log(`Place ${placeId} - New average: ${averageRating}, Total reviews: ${reviews.length}`);
  }
}
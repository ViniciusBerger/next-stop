import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schema/review.schema';
import { CreateReviewDTO } from './DTOs/create.review.DTO';
import { GetReviewDTO } from './DTOs/get.review.DTO';
import { LikeReviewDTO } from './DTOs/like.review.DTO';

@Injectable()
export class ReviewService {
  private reviewModel: Model<Review>;

  constructor(@InjectModel(Review.name) reviewModelReceived: Model<Review>) {
    this.reviewModel = reviewModelReceived;
  }

  // CREATE - Add a new review
  async createReview(createReviewDTO: CreateReviewDTO): Promise<Review> {
    const newReview = new this.reviewModel(createReviewDTO);
    const savedReview = await newReview.save();

    // After creating review, update Place's rating
    await this.updatePlaceRating(createReviewDTO.place);

    return savedReview;
  }

  // GET ALL - Get all reviews (with optional filters)
  async getAllReviews(getReviewDTO?: GetReviewDTO): Promise<Review[]> {
    const mongoQuery: any = {};

    if (getReviewDTO) {
      if (getReviewDTO.author) mongoQuery.author = getReviewDTO.author;
      if (getReviewDTO.place) mongoQuery.place = getReviewDTO.place;
      if (getReviewDTO.event) mongoQuery.event = getReviewDTO.event;
    }

    return await this.reviewModel
      .find(mongoQuery)
      .populate('author', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('event', 'name date') // Optional - may be null
      .populate('likedBy', 'username profilePicture')
      .sort({ createdAt: -1 }) // Most recent first
      .exec();
  }

  // GET ONE - Get a specific review by ID
  async getReview(getReviewDTO: GetReviewDTO): Promise<Review | null> {
    const { id } = getReviewDTO;

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

  // GET PLACE REVIEWS - Get all reviews for a specific place
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ place: placeId })
      .populate('author', 'username profilePicture')
      .populate('event', 'name date')
      .populate('likedBy', 'username profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  // GET USER REVIEWS - Get all reviews by a specific user
  async getUserReviews(userId: string): Promise<Review[]> {
    return await this.reviewModel
      .find({ author: userId })
      .populate('place', 'name address category customImages')
      .populate('event', 'name date')
      .sort({ createdAt: -1 })
      .exec();
  }

  // DELETE - Remove a review
  async deleteReview(reviewId: string): Promise<{ deleted: boolean; message: string }> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const placeId = review.place.toString();
    await this.reviewModel.findByIdAndDelete(reviewId).exec();

    // After deleting review, update Place's rating
    await this.updatePlaceRating(placeId);

    return {
      deleted: true,
      message: 'Review deleted successfully',
    };
  }

  // LIKE - Toggle like on a review
  async toggleLike(likeReviewDTO: LikeReviewDTO): Promise<Review> {
    const { reviewId, userId } = likeReviewDTO;

    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already liked this review
    const userIndex = review.likedBy.findIndex(
      (id) => id.toString() === userId.toString(),
    );

    if (userIndex > -1) {
      // User already liked - UNLIKE
      review.likedBy.splice(userIndex, 1);
      review.likes = Math.max(0, review.likes - 1);
    } else {
      // User hasn't liked - LIKE
      review.likedBy.push(userId as any);
      review.likes += 1;
    }

    return await review.save();
  }

  // HELPER - Update Place's average rating and review count
  private async updatePlaceRating(placeId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ place: placeId }).exec();

    if (reviews.length === 0) {
      // No reviews - reset to 0
      // This would require PlaceService - implement later when integrating modules
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // TODO: Call PlaceService to update place.averageUserRating and place.totalUserReviews
    // Will be implemented when modules are integrated
    console.log(`Place ${placeId} - New average: ${averageRating}, Total reviews: ${reviews.length}`);
  }
}
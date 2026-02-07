import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDTO } from './DTOs/create.review.DTO';
import { GetReviewDTO } from './DTOs/get.review.DTO';
import { LikeReviewDTO } from './DTOs/like.review.DTO';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDTO } from './DTOs/review.response.DTO';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // POST /reviews - Create a new review
  @Post()
  async createReview(@Body() createReviewDTO: CreateReviewDTO) {
    const newReview = await this.reviewService.createReview(createReviewDTO);

    return plainToInstance(ReviewResponseDTO, newReview.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /reviews - Get all reviews (with optional filters)
  @Get()
  async getReviews(@Query() getReviewDTO?: GetReviewDTO) {
    const reviews = await this.reviewService.getAllReviews(getReviewDTO);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // GET /reviews/details - Get a specific review by ID
  @Get('details')
  async getReview(@Query() getReviewDTO: GetReviewDTO) {
    if (!getReviewDTO.id) {
      throw new BadRequestException('Please provide a review ID');
    }

    const review = await this.reviewService.getReview(getReviewDTO);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return plainToInstance(ReviewResponseDTO, review.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /reviews/place/:placeId - Get all reviews for a specific place
  @Get('place/:placeId')
  async getPlaceReviews(@Param('placeId') placeId: string) {
    const reviews = await this.reviewService.getPlaceReviews(placeId);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // GET /reviews/user/:userId - Get all reviews by a specific user
  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    const reviews = await this.reviewService.getUserReviews(userId);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // DELETE /reviews/:id - Delete a review
  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    return await this.reviewService.deleteReview(id);
  }

  // POST /reviews/like - Toggle like on a review
  @Post('like')
  async toggleLike(@Body() likeReviewDTO: LikeReviewDTO) {
    const updatedReview = await this.reviewService.toggleLike(likeReviewDTO);

    return plainToInstance(ReviewResponseDTO, updatedReview.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
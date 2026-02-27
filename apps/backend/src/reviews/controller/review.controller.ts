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
  Headers,
  ForbiddenException
} from '@nestjs/common';
import { ReviewService } from '../service/review.service';
import { CreateReviewDTO } from '../DTOs/create.review.DTO';
import { GetReviewDTO } from '../DTOs/get.review.DTO';
import { LikeReviewDTO } from '../DTOs/like.review.DTO';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDTO } from '../DTOs/review.response.DTO';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Creates a new review (also serves as feed post)
   * POST /reviews
   */
  @Post()
  async createReview(@Body() createReviewDTO: CreateReviewDTO) {
    const newReview = await this.reviewService.createReview(createReviewDTO);

    return plainToInstance(ReviewResponseDTO, newReview.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves all reviews (Home Feed)
   * GET /reviews
   */
  @Get()
  async getReviews(@Query() getReviewDTO?: GetReviewDTO) {
    const reviews = await this.reviewService.getAllReviews(getReviewDTO);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Retrieves a specific review
   * GET /reviews/details?id=xxx
   */
  @Get('details')
  async getReview(@Query() getReviewDTO: GetReviewDTO) {
    if (!getReviewDTO.id) {
      throw new BadRequestException('Please provide a review ID');
    }

    const review = await this.reviewService.getReview(getReviewDTO);

    return plainToInstance(ReviewResponseDTO, review.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves all reviews for a specific place
   * GET /reviews/place/:placeId
   */
  @Get('place/:placeId')
  async getPlaceReviews(@Param('placeId') placeId: string) {
    const reviews = await this.reviewService.getPlaceReviews(placeId);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Retrieves all reviews by a specific user (History)
   * GET /reviews/user/:userId
   */
  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    const reviews = await this.reviewService.getUserReviews(userId);

    return reviews.map((review) =>
      plainToInstance(ReviewResponseDTO, review.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
 * Deletes a review (author only)
 * DELETE /reviews/:id
 */
@Delete(':id')
async deleteReview(
  @Param('id') id: string,
  @Headers('user-id') userId: string,
  @Headers('user-role') userRole?: string,
) {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  return await this.reviewService.deleteReview(id, userId, userRole);
}

  /**
   * Toggles like on a review
   * POST /reviews/like
   */
  @Post('like')
  async toggleLike(@Body() likeReviewDTO: LikeReviewDTO) {
    const updatedReview = await this.reviewService.toggleLike(likeReviewDTO);

    return plainToInstance(ReviewResponseDTO, updatedReview.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
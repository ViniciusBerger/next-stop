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
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { ReviewService } from '../service/review.service';
import { CreateReviewDTO } from '../DTOs/create.review.DTO';
import { GetReviewDTO } from '../DTOs/get.review.DTO';
import { LikeReviewDTO } from '../DTOs/like.review.DTO';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDTO } from '../DTOs/review.response.DTO';
import { UserService } from '../../user/service/user.service';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new review (also serves as feed post)
   * POST /reviews
   */
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createReview(@Body() createReviewDTO: CreateReviewDTO) {
    const newReview = await this.reviewService.createReview(createReviewDTO);
    const obj = newReview.toObject();
    obj._id = obj._id?.toString();
    if (obj.author && typeof obj.author === 'object') {
      obj.author._id = obj.author._id?.toString();
    }
    return plainToInstance(ReviewResponseDTO, obj, {
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

    return reviews.map((review) => {
      const obj = review.toObject();
      obj._id = obj._id?.toString();
      if (obj.author && typeof obj.author === 'object') {
        obj.author._id = obj.author._id?.toString();
      }
      return plainToInstance(ReviewResponseDTO, obj, {
        excludeExtraneousValues: true,
      });
    });
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
    const obj = review.toObject();
    obj._id = obj._id?.toString();
    if (obj.author && typeof obj.author === 'object') {
      obj.author._id = obj.author._id?.toString();
    }
    return plainToInstance(ReviewResponseDTO, obj, {
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

    return reviews.map((review) => {
      const obj = review.toObject();
      obj._id = obj._id?.toString();
      if (obj.author && typeof obj.author === 'object') {
        obj.author._id = obj.author._id?.toString();
      }
      return plainToInstance(ReviewResponseDTO, obj, {
        excludeExtraneousValues: true,
      });
    });
  }

  /**
   * Retrieves all reviews by a user's MongoDB _id
   * GET /reviews/profile/:mongoId
   */
  @Get('profile/:mongoId')
  async getReviewsByMongoId(@Param('mongoId') mongoId: string) {
    const reviews = await this.reviewService.getReviewsByMongoId(mongoId);

    return reviews.map((review) => {
      const obj = review.toObject();
      obj._id = obj._id?.toString();
      if (obj.author && typeof obj.author === 'object') {
        obj.author._id = obj.author._id?.toString();
      }
      return plainToInstance(ReviewResponseDTO, obj, {
        excludeExtraneousValues: true,
      });
    });
  }

  /**
   * Retrieves all reviews by a specific user (History)
   * GET /reviews/user/:userId
   */
  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    const reviews = await this.reviewService.getUserReviews(userId);

    return reviews.map((review) => {
      const obj = review.toObject();
      obj._id = obj._id?.toString();
      if (obj.author && typeof obj.author === 'object') {
        obj.author._id = obj.author._id?.toString();
      }
      return plainToInstance(ReviewResponseDTO, obj, {
        excludeExtraneousValues: true,
      });
    });
  }

  /**
 * Deletes a review (author or admin only)
 * DELETE /reviews/:id
 */
@Delete(':id')
@UseGuards(FirebaseAuthGuard)
async deleteReview(
  @Param('id') id: string,
  @Req() req: any,
) {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) throw new BadRequestException('User not authenticated');

  const user = await this.userService.findById({ firebaseUid });
  if (!user) throw new BadRequestException('User not found');
  const userId = user._id.toString();
  const userRole = user.role;

  return await this.reviewService.deleteReview(id, userId, userRole);
}

  /**
   * Toggles like on a review
   * POST /reviews/like
   */
  @Post('like')
  @UseGuards(FirebaseAuthGuard)
  async toggleLike(@Body() likeReviewDTO: LikeReviewDTO) {
    const updatedReview = await this.reviewService.toggleLike(likeReviewDTO);
    const obj = updatedReview.toObject();
    obj._id = obj._id?.toString();
    if (obj.author && typeof obj.author === 'object') {
      obj.author._id = obj.author._id?.toString();
    }
    if (Array.isArray(obj.likedBy)) {
      obj.likedBy = obj.likedBy.map((u: any) =>
        u && typeof u === 'object' && u._id !== undefined
          ? { ...u, _id: u._id.toString() }
          : { _id: u?.toString?.() ?? String(u) },
      );
    }
    return plainToInstance(ReviewResponseDTO, obj, {
      excludeExtraneousValues: true,
    });
  }
}
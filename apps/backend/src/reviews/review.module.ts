import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewController } from './controller/review.controller';
import { ReviewService } from './service/review.service';
import { ReviewRepository } from './repository/review.repository';
import { Review, reviewSchema } from './schema/review.schema';

/**
 * Review Module
 * Manages reviews (also serves as the app's feed)
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: reviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService], // Export for use in Place module
})
export class ReviewModule {}
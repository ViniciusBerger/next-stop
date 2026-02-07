import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review, reviewSchema } from './schema/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: reviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService], // Export for use in other modules (e.g., Place)
})
export class ReviewModule {}
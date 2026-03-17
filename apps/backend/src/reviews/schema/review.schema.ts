import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Review' })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId; // Who wrote the review

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  place: Types.ObjectId; // Place being reviewed (ALWAYS required)

  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  event?: Types.ObjectId; // Optional - if review was made after an event

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number; // 1-5 stars

  @Prop({ type: String, required: true })
  reviewText: string; // Review content

  @Prop({ type: [String], default: [] })
  images: string[]; // URLs to photos (optional)

  @Prop({ type: Date, required: true })
  date: Date; // When the user visited the place (for feed/history display)

  @Prop({ type: Number, default: 0 })
  likes: number; // Counter of likes

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: Types.ObjectId[]; // Users who liked this review

  @Prop({ type: Date, default: Date.now })
  createdAt: Date; // When the review was actually performed
}

export const reviewSchema = SchemaFactory.createForClass(Review);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Outing' })
export class Outing extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Who made the outing/post

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  place: Types.ObjectId; // Where they went

  @Prop({ type: String, required: true })
  description: string; // User's description of the outing

  @Prop({ type: [String], default: [] })
  images: string[]; // URLs to photos

  @Prop({ type: Date, required: true })
  date: Date; // When the outing happened (Month-year)

  @Prop({ type: Number, default: 0 })
  likes: number; // Counter of likes

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: Types.ObjectId[]; // Users who liked this outing

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const outingSchema = SchemaFactory.createForClass(Outing);
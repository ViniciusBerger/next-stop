import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Place' })
export class Place extends Document {
  // FROM GOOGLE API
  @Prop({ type: String, required: true, unique: true })
  googlePlaceId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string; // formatted_address from Google

  @Prop({ type: String, required: true })
  category: string; // Restaurant, Pub, Park, etc

  @Prop({ type: String, default: '' })
  description: string; // editorial_summary from Google (or empty)

  // FROM USERS (CUSTOMIZED)
  @Prop({ type: [String], default: [] })
  customImages: string[]; // URLs to user-uploaded images

  @Prop({ type: [String], default: [] })
  customTags: string[]; // cuisine type, ambiance, etc

  // SOCIAL DATA
  @Prop({ type: Number, default: 0 })
  averageUserRating: number; // calculated from reviews

  @Prop({ type: Number, default: 0 })
  totalUserReviews: number; // counter

  // METADATA
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: Types.ObjectId; // first user who added this place

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const placeSchema = SchemaFactory.createForClass(Place);
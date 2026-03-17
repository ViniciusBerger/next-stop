import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Place' })
export class Place extends Document {
  @Prop({ type: String, required: true, unique: true })
  googlePlaceId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, min: 0, max: 4 })
  priceLevel?: number;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  })
  location?: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: [String], default: [] })
  customImages: string[];

  @Prop({ type: [String], default: [] })
  customTags: string[];

  @Prop({ type: Number, default: 0 })
  averageUserRating: number;

  @Prop({ type: Number, default: 0 })
  totalUserReviews: number;

  // ← ADICIONAR CAMPOS DO GOOGLE PLACES
  @Prop({ type: Number })
  googleRating?: number;

  @Prop({ type: Number })
  googleReviewCount?: number;

  @Prop({ type: [String], default: [] })
  googlePhotos?: string[];

  @Prop({ type: Object })
  openingHours?: any;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const placeSchema = SchemaFactory.createForClass(Place);

placeSchema.index({ location: '2dsphere' });
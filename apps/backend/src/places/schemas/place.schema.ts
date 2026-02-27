import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Place' })
export class Place extends Document {
  // FROM GOOGLE PLACES
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

  // ============== PRICE LEVEL ==============
  @Prop({ type: Number, min: 0, max: 4 })
  priceLevel?: number;

  // ============== LOCATION (OPTIONAL) ==============
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

  // FROM USERS
  @Prop({ type: [String], default: [] })
  customImages: string[];

  @Prop({ type: [String], default: [] })
  customTags: string[];

  // SOCIAL DATA
  @Prop({ type: Number, default: 0 })
  averageUserRating: number;

  @Prop({ type: Number, default: 0 })
  totalUserReviews: number;

  // METADATA
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const placeSchema = SchemaFactory.createForClass(Place);

// Geospatial index
placeSchema.index({ location: '2dsphere' });
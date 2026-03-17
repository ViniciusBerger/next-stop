import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Badge Schema - Collection of all available badges
 * Designer will provide iconUrl from Firebase Storage
 */
@Schema({ collection: 'Badge' })
export class Badge extends Document {
  // Unique identifier (slug-style)
  @Prop({ type: String, required: true, unique: true })
  badgeId: string;  // "trendsetter", "social-butterfly"

  // Display name
  @Prop({ type: String, required: true })
  name: string;  // "The Trendsetter"

  // How to earn this badge
  @Prop({ type: String, required: true })
  description: string;  // "Have 10 people join an event you created"

  // Category grouping
  @Prop({ type: String, required: true })
  category: string;  // "Social & Community", "Exploration & Discovery", etc

  // Icon URL from Firebase Storage
  @Prop({ type: String, default: '' }) //PLACEHOLDERRRRRR
  iconUrl: string;  // Will be updated by admin when designer provides

  // Tier (for badges with levels)
  @Prop({ type: String })
  tier?: string;  // "Bronze", "Silver", "Gold"

  // How many times this badge has been awarded
  @Prop({ type: Number, default: 0 })
  totalAwarded: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const badgeSchema = SchemaFactory.createForClass(Badge);
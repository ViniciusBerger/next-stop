import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enum for privacy options
export enum PrivacyOption {
  ALL = 'All',
  FRIENDS = 'Friends',
  NONE = 'None'
}

// Sub-schema for Profile Preferences
@Schema({ _id: false })
export class Preferences {
  @Prop({ type: String, default: '' })
  cuisine: string;

  @Prop({ type: String, default: '' })
  dietaryLabels: string;

  @Prop({ type: String, default: '' })
  allergies: string;

  @Prop({ type: String, default: '' })
  activities: string;
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences);

// Sub-schema for Profile Privacy
@Schema({ _id: false })
export class Privacy {
  @Prop({ type: String, enum: Object.values(PrivacyOption), default: PrivacyOption.FRIENDS })
  activityFeed: string;

  @Prop({ type: String, enum: Object.values(PrivacyOption), default: PrivacyOption.FRIENDS })
  favorites: string;

  @Prop({ type: String, enum: Object.values(PrivacyOption), default: PrivacyOption.FRIENDS })
  myEvents: string;

  @Prop({ type: String, enum: Object.values(PrivacyOption), default: PrivacyOption.FRIENDS })
  badges: string;

  @Prop({ type: String, enum: Object.values(PrivacyOption), default: PrivacyOption.FRIENDS })
  preferences: string;
}

export const PrivacySchema = SchemaFactory.createForClass(Privacy);

// Main schema for Profile
@Schema({ _id: false })
export class Profile extends Document {
  @Prop({ type: PreferencesSchema, default: () => ({}) })
  preferences: Preferences;

  @Prop({ type: PrivacySchema, default: () => ({}) })
  privacy: Privacy;
}

export const profileSchema = SchemaFactory.createForClass(Profile);
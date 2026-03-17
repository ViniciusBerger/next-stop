import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// Enum for privacy options
export enum PrivacyOption {
  ALL = 'All',
  FRIENDS = 'Friends',
  NONE = 'None'
}

// Sub-schema for Privacy
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
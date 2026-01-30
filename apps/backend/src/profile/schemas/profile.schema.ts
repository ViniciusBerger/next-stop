import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Profile {
  @Prop({
    type: {
      activity_feed: { type: String, enum: ['all', 'friends', 'none'], default: 'friends' },
      favorites: { type: String, enum: ['all', 'friends', 'none'], default: 'friends' },
      my_events: { type: String, enum: ['all', 'friends', 'none'], default: 'friends' },
      badges: { type: String, enum: ['all', 'friends', 'none'], default: 'friends' },
      preferences: { type: String, enum: ['all', 'friends', 'none'], default: 'friends' },
    },
    _id: false,
  })
  privacy: {
    activity_feed: string;
    favorites: string;
    my_events: string;
    badges: string;
    preferences: string;
  };
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
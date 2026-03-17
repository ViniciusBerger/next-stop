import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Privacy, PrivacySchema } from './privacy.sub-schema';
import { Preferences, PreferencesSchema } from './preferences.sub-schema';

// Main schema for Profile
@Schema({ _id: false })
export class Profile extends Document {
  @Prop({ type: PreferencesSchema, default: () => ({}) })
  preferences?: Preferences;

  @Prop({ type: PrivacySchema, default: () => ({}) })
  privacy?: Privacy;
  
  @Prop({type: String, default: '' }) // url to the profile picture
  profilePicture?: string;

  @Prop({type: String, default: '' })
  bio?: string;
}

export const profileSchema = SchemaFactory.createForClass(Profile);
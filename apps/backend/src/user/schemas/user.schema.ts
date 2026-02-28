import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile } from '../../profile/schemas/profile.schema';
import { Badge } from './badges.schema';

@Schema({ collection: 'User' })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  firebaseUid: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: Profile, default: () => ({}) })
  profile: Profile;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  profilePicture: string;

  @Prop({ type: [Badge], default: [] })
  badges: Badge[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: [] })
  friends: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  // TASK 2: Account status validation fields
  @Prop({ type: String, default: 'ACTIVE' })
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';

  @Prop({ type: Date, default: null })
  suspendedUntil: Date | null;

  //TASK 1: Email verification fields 
  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: String })
  verificationToken: string;

  @Prop({ type: Date })
  tokenExpiresAt: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastLogin: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

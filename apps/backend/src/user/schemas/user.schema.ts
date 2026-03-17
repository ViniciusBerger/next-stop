import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
<<<<<<< HEAD
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
=======
import { Profile, profileSchema } from '../../profile/schemas/profile.schema'
import { Badge } from '../../badges/schemas/badges.schema';  // ← Import Badge

@Schema({ collection: 'User' })
export class User extends Document {
    
    @Prop({type: String, required: true, unique: true})
    firebaseUid: string;
    
    @Prop({type: String, default: "member"})
    role: string;

    @Prop({type: String, required:true, unique: true})
    username: string;
    
    @Prop({type: String, unique: true})
    email: string;
    
    @Prop({type: profileSchema, default: () => ({}) })
    profile: Profile;

    // ==== BADGES (UPDATED) ====
    // Each badge entry has a reference to Badge + when it was earned
    @Prop({ 
      type: [{ 
        badge: { type: Types.ObjectId, ref: 'Badge' },
        earnedAt: { type: Date, default: Date.now }
      }], 
      default: [] 
    })
    badges: { badge: Types.ObjectId; earnedAt: Date }[];

    @Prop({type: [Types.ObjectId], ref: 'User', default: []})
    friends: Types.ObjectId[];

    // ==== BAN/SUSPEND ====
    @Prop({type: Boolean, default: false})
    isBanned: boolean

    @Prop({type: Boolean, default: false})
    isSuspended: boolean

    @Prop({type: Date, required: false})
    bannedAt?: Date;

    @Prop({type: Date, required: false})
    suspendedUntil?: Date;

    @Prop({type: String, required: false})
    banReason?: string;

    // ==== DATES ====

    @Prop({type: Date, default: Date.now})
    createdAt: Date;
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

  @Prop({ type: Types.ObjectId, ref: 'User', default: [] })
  friends: Types.ObjectId[];

<<<<<<< HEAD
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
=======
    @Prop({type: Date, default: Date.now})
    lastLogin: Date;

    // ==== FAVORITES/WISHLIST ====

    @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
    favorites: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
    wishlist: Types.ObjectId[];
}

export const userSchema = SchemaFactory.createForClass(User);
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

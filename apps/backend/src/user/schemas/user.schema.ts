import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile, profileSchema } from '../../profile/schemas/profile.schema';
import { Badge } from './badges.schema';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  firebaseUid: string;

  @Prop({ type: String, default: 'member' })
  role: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, unique: true, sparse: true })
  email: string;

  @Prop({ type: profileSchema, default: () => ({}) })
  profile: Profile;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' }) // URL da foto de perfil
  profilePicture: string;

  @Prop({ type: [Badge], default: [] })
  badges: Badge[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  friends: Types.ObjectId[];

  // ==== BAN/SUSPEND ====
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: Boolean, default: false })
  isSuspended: boolean;

  @Prop({ type: Date })
  bannedAt?: Date;

  @Prop({ type: Date })
  suspendedUntil?: Date;

  @Prop({ type: String })
  banReason?: string;

  @Prop({ type: String })
  suspensionReason?: string;

  // ==== FAVORITES/WISHLIST ====
  @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
  favorites: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
  wishlist: Types.ObjectId[];

  // ==== DATES ====
  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  lastLogin?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

// Transform to clean _id/__v and expose id
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    if (ret && ret._id) {
      ret.id = ret._id?.toString?.() ?? ret._id;
      delete ret._id;
    }
  },
});

// ❌ Removed to avoid duplicate index warnings (we already have unique on @Prop):
// userSchema.index({ username: 1 }, { unique: true });
// userSchema.index({ email: 1 }, { unique: true, sparse: true });
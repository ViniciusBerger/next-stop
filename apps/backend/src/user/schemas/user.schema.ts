import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile, profileSchema } from '../../profile/schemas/profile.schema'
import { Badge } from './badges.schema';

@Schema({ collection: 'User' })
export class User extends Document {
    
    @Prop({type: String, required: true, unique: true})
    firebaseUid: string;
    
    @Prop({type: String, required:true})
    role: string;

    @Prop({type: String, required:true, unique: true})
    username: string;
    
    @Prop({type: String, unique: true})
    email: string;
    
    @Prop({type: profileSchema, default: () => ({}) })
    profile: Profile;

    @Prop({type: String, default: '' })
    bio: string;

    @Prop({type: String, default: '' }) // url to the profile picture
    profilePicture: string;

    @Prop({type: [Badge], default: [] })
    badges: Badge[];

    @Prop({type: Types.ObjectId, ref: 'User', default: []})
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

    @Prop({type: Date, default: Date.now})
    updatedAt: Date;

    @Prop({type: Date, default: Date.now})
    lastLogin: Date;

    // ==== FAVORITES/WISHLIST ====

    @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
    favorites: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
    wishlist: Types.ObjectId[];
}


export const userSchema = SchemaFactory.createForClass(User);
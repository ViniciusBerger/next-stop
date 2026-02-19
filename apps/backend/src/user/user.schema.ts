import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Profile } from '../profile/schemas/profile.schema'
import { Badge } from '../badges/badges.schema';

/**
 * Persistence layer representation of a User.
 * Maps to the 'User' collection in MongoDB.
 */
@Schema({ collection: 'User' })
export class User extends Document {
    
    // Primary identity link for Firebase Authentication; ensures 1:1 mapping with Auth provider. 
    @Prop({type: String, required: true, unique: true})
    firebaseUid: string;
    
    // Authorization level; defaults to 'member' to enforce least-privilege by default. 
    @Prop({type: String, default: "member"})
    role: string;

    // Unique handle for social identification and URL slugging. 
    @Prop({type: String, required:true, unique: true})
    username: string;
    
    // Unique contact point; used for notifications and secondary account recovery. 
    @Prop({type: String, unique: true})
    email: string;
    
    // One-to-One Composition: Profile data is lifecycle-dependent on the User. 
    @Prop({type: SchemaFactory.createForClass(Profile), default: () => ({})})
    profile: Profile;

    // Array of earned achievements; currently embedded for fast read access. 
    @Prop({type: [Badge], default: [] })
    badges: Badge[];

    // Self-referencing relationship for social graph; stores ObjectIds as Strings. 
    @Prop({type: [String], ref: 'User', default: []})
    friends: string[];

    // Administrative flag for access control; bypasses standard Auth logic if true. 
    @Prop({type: Boolean, default: false})
    isBanned: boolean

    // Audit fields: Manually updated (Consider { timestamps: true } for automation). 
    @Prop({type: Date, default: Date.now})
    createdAt: Date;

    @Prop({type: Date, default: Date.now})
    updatedAt: Date;

    @Prop({type: Date, default: Date.now})
    lastLogin: Date;
}

export const userSchema = SchemaFactory.createForClass(User);
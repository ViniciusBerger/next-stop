import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AddressSchema } from 'src/common/schemas/address.schema';
import { ProfileSchema } from 'src/profile/schemas/profile.schema';
import { BadgeSchema } from './badges.schema';

@Schema()
export class UserSchema extends Document {
    @Prop({type: String, required: true, unique: true})
    firebaseUid: string;
    
    @Prop({type: String, required:true})
    role: string;
    
    @Prop({type: String, required:true, unique: true, lowercase: true, trim: true,match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],})
    email: string;
    
    @Prop({type: String, required: true, select: false }) // hides from queries by default
    password: string; 
    
    @Prop({type: ProfileSchema, required: true})
    profile: ProfileSchema;

    @Prop({type: String, default: '' })
    bio: string;

    @Prop({type: String, default: '' }) // url to the profile picture
    profilePicture: string;

    @Prop({type: BadgeSchema, default: [] })
    badges: BadgeSchema[];

    @Prop({type: Types.ObjectId, ref: 'user', default: []})
    friends: Types.ObjectId[];

    @Prop({type: Boolean, deafault: false})
    isBanned: boolean

    @Prop({type: Date, default: Date.now})
    createdAt: Date;

    @Prop({type: Date, default: Date.now})
    updatedAt: Date;

    @Prop({type: Date, default: Date.now})
    lastLogin: Date;
}


export const userSchema = SchemaFactory.createForClass(UserSchema);
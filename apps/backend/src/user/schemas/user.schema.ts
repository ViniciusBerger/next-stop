import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile } from '../../profile/schemas/profile.schema'
import { Badge } from './badges.schema';

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
    
    @Prop({type: SchemaFactory.createForClass(Profile), default: () => ({})})
    profile: Profile;

    @Prop({type: [Badge], default: [] })
    badges: Badge[];

    @Prop({type: [String], ref: 'User', default: []})
    friends: string[];

    @Prop({type: Boolean, default: false})
    isBanned: boolean

    @Prop({type: Date, default: Date.now})
    createdAt: Date;

    @Prop({type: Date, default: Date.now})
    updatedAt: Date;

    @Prop({type: Date, default: Date.now})
    lastLogin: Date;
}


export const userSchema = SchemaFactory.createForClass(User);
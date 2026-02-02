import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AddressSchema } from 'src/common/schemas/address.schema';
import { Profile } from 'src/profile/schemas/profile.schema';
import { Badge } from './badges.schema';

@Schema({ collection: 'User' })
export class User extends Document {
    
    @Prop({type: String, required: true, unique: true})
    firebaseUid: string;
    
    @Prop({type: String, required:true})
    role: string;

    @Prop({type: String, required:true})
    username: string;
    
    @Prop({type: String,})
    email: string;
    
    @Prop({type: Profile}) // needs to be done
    profile: Profile;

    @Prop({type: String, default: '' })
    bio: string;

    @Prop({type: String, default: '' }) // url to the profile picture
    profilePicture: string;

    @Prop({type: [Badge], default: [] })
    badges: Badge[];

    @Prop({type: Types.ObjectId, ref: 'User', default: []})
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


export const userSchema = SchemaFactory.createForClass(User);
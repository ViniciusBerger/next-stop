import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProfileSchema } from 'src/profile/schemas/profile.schema';

@Schema()
export class UserSchema extends Document {
    @Prop({ required: true, unique: true})
    firebaseUid: string;
    @Prop({ required:true})
    role: string;
    @Prop({required:true, unique: true, lowercase: true, trim: true,match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],})
    email: string;
    @Prop({type: ProfileSchema, required: true})
    profile: ProfileSchema;
}


export const userSchema = SchemaFactory.createForClass(UserSchema);
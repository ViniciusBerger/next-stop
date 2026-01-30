import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//** TO BE FINISHED */


@Schema()
export class ProfileSchema extends Document {
    @Prop({ required: true})
    userId: string;
}


export const profileSchema = SchemaFactory.createForClass(ProfileSchema);
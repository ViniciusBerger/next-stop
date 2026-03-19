import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FriendsDocument = Friends & Document;

@Schema()
export class Friends {
  @Prop({ required: true })
  user1: string;

  @Prop({ required: true })
  user2: string;

  @Prop({ default: 'accepted' })
  status: string;
}

export const FriendsSchema = SchemaFactory.createForClass(Friends);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Announcement extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) message: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

// apps/backend/src/ai/schemas/vibe-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Automatically adds 'createdAt' and 'updatedAt'
export class AiLog extends Document {
  @Prop({ required: true })
  userVibe: string;

  @Prop({ required: true })
  pickedPlaceId: string;

  @Prop()
  userId?: string; // Optional: Store the Firebase UID if logged in
}

export const AiLogSchema = SchemaFactory.createForClass(AiLog);
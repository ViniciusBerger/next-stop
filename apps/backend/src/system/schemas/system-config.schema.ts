import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SystemConfig extends Document {
  @Prop({ default: true }) googleMapsEnabled: boolean;
  @Prop({ default: true }) geminiEnabled: boolean;
  @Prop({ default: false }) maintenanceMode: boolean;
  @Prop({ default: true }) locationHistoryEnabled: boolean;
  @Prop({ default: false }) anonymizeData: boolean;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);

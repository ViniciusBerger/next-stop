import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SystemSettingDocument = SystemSetting & Document;

@Schema({ timestamps: true })
export class SystemSetting {

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "admin" })
  updatedBy: string;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);
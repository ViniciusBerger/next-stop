import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Schema } from "@nestjs/mongoose";

// Sub-schema for Preferences
@Schema({ _id: false })
export class Preferences {
  @Prop({ type: String, default: '' })
  cuisine: string;

  @Prop({ type: String, default: '' })
  dietaryLabels: string;

  @Prop({ type: String, default: '' })
  allergies: string;

  @Prop({ type: String, default: '' })
  activities: string;
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences);
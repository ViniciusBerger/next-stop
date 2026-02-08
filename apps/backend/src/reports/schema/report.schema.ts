import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Enum for report type
export enum ReportType {
  FEEDBACK = 'feedback',
  ISSUE = 'issue'
}

// Enum for report status
export enum ReportStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

// Enum for reported item types
export enum ReportedItemType {
  USER = 'User',
  REVIEW = 'Review',
  PLACE = 'Place',
  EVENT = 'Event'
}

// Sub-schema for reported item (optional)
@Schema({ _id: false })
export class ReportedItem {
  @Prop({ type: String, enum: Object.values(ReportedItemType), required: true })
  itemType: string; // "User", "Review", "Place", or "Event"

  @Prop({ type: Types.ObjectId, required: true })
  itemId: Types.ObjectId; // Reference to the reported item
}

export const ReportedItemSchema = SchemaFactory.createForClass(ReportedItem);

@Schema({ collection: 'Report' })
export class Report extends Document {
  @Prop({ type: String, enum: Object.values(ReportType), required: true })
  type: string; // "feedback" or "issue"

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId; // User who created the report

  @Prop({ type: ReportedItemSchema, required: false })
  reportedItem?: ReportedItem; // Optional - what is being reported

  @Prop({ type: String, enum: Object.values(ReportStatus), default: ReportStatus.PENDING })
  status: string; // "pending" or "completed"

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  completedAt?: Date; // When admin marked as completed
}

export const reportSchema = SchemaFactory.createForClass(Report);
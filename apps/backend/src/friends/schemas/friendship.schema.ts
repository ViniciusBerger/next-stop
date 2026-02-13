import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Friendship
 *
 * Represents an accepted connection between two users.
 * We keep a single directional record (userId -> friendId).
 * To query "all friends", read both directions (or write two records if you prefer).
 * This schema enforces uniqueness per pair.
 */
@Schema({ collection: "friendships", timestamps: true })
export class Friendship extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  friendId: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  since: Date;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const friendshipSchema = SchemaFactory.createForClass(Friendship);

// Prevent duplicate edges (userId -> friendId).
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });
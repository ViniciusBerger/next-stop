import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * FriendRequest
 *
 * Represents an invitation from one user to another.
 * The lifecycle is typically: pending -> accepted/rejected/cancelled.
 * We prevent duplicate pending requests between the same pair (via partial index).
 */
@Schema({ collection: "friend_requests", timestamps: true })
export class FriendRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  from: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  to: Types.ObjectId;

  @Prop({
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  })
  status: "pending" | "accepted" | "rejected" | "cancelled";

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const friendRequestSchema = SchemaFactory.createForClass(FriendRequest);

// Avoid duplicate pending requests for the same pair.
// NOTE: partialFilterExpression works in Mongoose for MongoDB >= 3.2.
friendRequestSchema.index(
  { from: 1, to: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
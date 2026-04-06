import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../schema/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name) private model: Model<Notification>,
  ) {}

  async create(data: {
    recipient: string;
    sender: string;
    type: string;
    message: string;
    relatedId?: string;
  }) {
    return this.model.create({
      ...data,
      recipient: new Types.ObjectId(data.recipient),
      sender: new Types.ObjectId(data.sender),
      relatedId: data.relatedId ? new Types.ObjectId(data.relatedId) : undefined,
    });
  }

  async getByRecipient(userId: string) {
    return this.model
      .find({ recipient: new Types.ObjectId(userId) })
      .populate('sender', 'username profile')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getUnreadCount(userId: string) {
    return this.model.countDocuments({
      recipient: new Types.ObjectId(userId),
      read: false,
    });
  }

  async markAsRead(notificationId: string) {
    return this.model.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.model.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { read: true },
    );
  }
}

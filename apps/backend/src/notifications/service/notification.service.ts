import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationType } from '../schema/notification.schema';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    private repo: NotificationRepository,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(data: {
    recipient: string;
    sender: string;
    type: NotificationType;
    message: string;
    relatedId?: string;
  }) {
    const notification = await this.repo.create(data);
    this.sendPush(data.recipient, data.sender, data.type, data.message).catch(
      (err) => console.error('Push notification failed:', err),
    );
    return notification;
  }

  async getByRecipient(userId: string) {
    return this.repo.getByRecipient(userId);
  }

  async getUnreadCount(userId: string) {
    return this.repo.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string) {
    return this.repo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.repo.markAllAsRead(userId);
  }

  private async sendPush(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
  ): Promise<void> {
    const [recipient, sender] = await Promise.all([
      this.userModel.findById(recipientId).select('expoPushToken').lean(),
      this.userModel.findById(senderId).select('username').lean(),
    ]);

    const token = recipient?.expoPushToken;
    if (!token) return;

    const senderName = sender?.username ?? 'Someone';
    const titleByType: Record<string, string> = {
      [NotificationType.FRIEND_REQUEST]: 'New friend request',
      [NotificationType.FRIEND_ACCEPTED]: 'Friend request accepted',
      [NotificationType.EVENT_INVITE]: 'New event invite',
    };
    const title = titleByType[type] ?? 'New notification';

    const payload = [
      {
        to: token,
        title,
        body: `${senderName} ${message}`,
        sound: 'default',
      },
    ];

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to send push notification:', err);
    }
  }
}

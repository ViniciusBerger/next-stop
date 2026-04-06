import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationType } from '../schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(private repo: NotificationRepository) {}

  async create(data: {
    recipient: string;
    sender: string;
    type: NotificationType;
    message: string;
    relatedId?: string;
  }) {
    return this.repo.create(data);
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
}

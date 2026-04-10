import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement } from '../schemas/announcement.schema';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<Announcement>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(title: string, message: string): Promise<Announcement> {
    const announcement = await this.announcementModel.create({ title, message });
    await this.sendPushToAll(title, message);
    return announcement;
  }

  async getAll(): Promise<Announcement[]> {
    return this.announcementModel.find().sort({ createdAt: -1 }).limit(20);
  }

  private async sendPushToAll(title: string, body: string): Promise<void> {
    const users = await this.userModel
      .find({ expoPushToken: { $exists: true, $ne: null } })
      .select('expoPushToken');

    const tokens = users.map((u) => u.expoPushToken).filter(Boolean);
    if (tokens.length === 0) return;

    const messages = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
    }));

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (err) {
      console.error('Failed to send push notifications:', err);
    }
  }
}

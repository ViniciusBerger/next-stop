// apps/backend/src/ai/service/vibe-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiLog } from '../schemas/ai-log.schema';

@Injectable()
export class AiLogService {
  constructor(@InjectModel(AiLog.name) private aiLogModel: Model<AiLog>) {}

  async logSearch(userVibe: string, pickedPlaceId: string, userId?: string) {
    const newLog = new this.aiLogModel({ userVibe, pickedPlaceId, userId });
    return newLog.save();
  }

  async getTrendingVibes() {
    return this.aiLogModel.aggregate([
      { $group: { _id: '$userVibe', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
  }

  async getDailyUsage(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.aiLogModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTotalSearches() {
    return this.aiLogModel.countDocuments();
  }

  async clearAllLogs(): Promise<{ deletedCount: number }> {
    const result = await this.aiLogModel.deleteMany({});
    return { deletedCount: result.deletedCount };
  }
}
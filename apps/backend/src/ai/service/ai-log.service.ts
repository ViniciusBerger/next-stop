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

  // This is for your Admin Dashboard later!
  async getTrendingVibes() {
    return this.aiLogModel.aggregate([
      { $group: { _id: '$userVibe', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
  }
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemConfig } from '../schemas/system-config.schema';

const ALLOWED_KEYS: (keyof SystemConfig)[] = [
  'googleMapsEnabled',
  'geminiEnabled',
  'maintenanceMode',
  'locationHistoryEnabled',
  'anonymizeData',
];

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectModel(SystemConfig.name) private configModel: Model<SystemConfig>,
  ) {}

  async getConfig(): Promise<SystemConfig> {
    let config = await this.configModel.findOne();
    if (!config) {
      config = await this.configModel.create({});
    }
    return config;
  }

  async updateConfig(key: string, value: boolean): Promise<SystemConfig> {
    if (!ALLOWED_KEYS.includes(key as keyof SystemConfig)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    let config = await this.configModel.findOne();
    if (!config) {
      config = await this.configModel.create({});
    }
    config.set(key, value);
    return config.save();
  }
}

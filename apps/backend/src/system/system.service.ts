import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SystemSetting } from "./schemas/system-setting.schema";

@Injectable()
export class SystemService {
  constructor(
    @InjectModel(SystemSetting.name)
    private settingModel: Model<SystemSetting>,
  ) {}

  async getAll() {
    return this.settingModel.find();
  }

  async update(key: string, value: string, admin: string) {
    return this.settingModel.findOneAndUpdate(
      { key },
      { value, updatedBy: admin },
      { new: true, upsert: true },
    );
  }
}
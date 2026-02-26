import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Badge } from "../schemas/badges.schema";
import { IbadgeData } from "./Ibadge.data";

@Injectable()
export class BadgeRepository {
  constructor(
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>
  ) {}

  async create(data: Partial<Badge>): Promise<Badge> {
    return await new this.badgeModel(data).save();
  }

  async findOne(filter: IbadgeData): Promise<Badge | null> {
    return await this.badgeModel.findOne(filter).exec();
  }

  async findMany(filter: IbadgeData): Promise<Badge[]> {
    return await this.badgeModel
      .find(filter)
      .sort({ category: 1, name: 1 })
      .exec();
  }

  async findAll(): Promise<Badge[]> {
    return await this.badgeModel
      .find()
      .sort({ category: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Badge | null> {
    return await this.badgeModel.findById(id).exec();
  }

  async findByBadgeId(badgeId: string): Promise<Badge | null> {
    return await this.badgeModel.findOne({ badgeId }).exec();
  }

  async update(
    filter: IbadgeData,
    update: UpdateQuery<Badge>
  ): Promise<Badge | null> {
    return await this.badgeModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  async delete(filter: IbadgeData): Promise<Badge | null> {
    return await this.badgeModel.findOneAndDelete(filter).exec();
  }

  async incrementTotalAwarded(badgeId: string): Promise<void> {
    await this.badgeModel
      .findOneAndUpdate(
        { badgeId },
        { $inc: { totalAwarded: 1 } }
      )
      .exec();
  }
}
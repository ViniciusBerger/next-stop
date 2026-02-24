import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Report } from "../schema/report.schema";
import { IreportData } from "./Ireport.data";

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>
  ) {}

  async create(data: Partial<Report>): Promise<Report> {
    return await new this.reportModel(data).save();
  }

  async findOne(filter: IreportData): Promise<Report | null> {
    return await this.reportModel.findOne(filter).exec();
  }

  async findMany(filter: IreportData): Promise<Report[]> {
    return await this.reportModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Report | null> {
    return await this.reportModel.findById(id).exec();
  }

  async update(
    filter: IreportData,
    update: UpdateQuery<Report>
  ): Promise<Report | null> {
    return await this.reportModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  async delete(filter: IreportData): Promise<Report | null> {
    return await this.reportModel.findOneAndDelete(filter).exec();
  }

  async save(report: Report): Promise<Report> {
    return await report.save();
  }

  async countDocuments(filter: IreportData): Promise<number> {
    return await this.reportModel.countDocuments(filter).exec();
  }
}
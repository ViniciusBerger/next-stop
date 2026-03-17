import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Review } from "../schema/review.schema";
import { IreviewData } from "./Ireview.data";

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>
  ) {}

  async create(data: Partial<Review>): Promise<Review> {
    return await new this.reviewModel(data).save();
  }

  async findOne(filter: IreviewData): Promise<Review | null> {
    return await this.reviewModel.findOne(filter).exec(); // ← SEM POPULATE
  }

  async findMany(filter: IreviewData): Promise<Review[]> {
    return await this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec(); // ← SEM POPULATE
  }

  async findById(id: string): Promise<Review | null> {
    return await this.reviewModel.findById(id).exec(); // ← SEM POPULATE
  }

  async update(
    filter: IreviewData,
    update: UpdateQuery<Review>
  ): Promise<Review | null> {
    return await this.reviewModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  async delete(filter: IreviewData): Promise<Review | null> {
    return await this.reviewModel.findOneAndDelete(filter).exec();
  }

  async save(review: Review): Promise<Review> {
    return await review.save();
  }
}
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { IprofileData } from "./Iprofile.data";

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findOne(filter: IprofileData): Promise<User | null> {
    return await this.userModel.findOne(filter).exec();
  }

  async update(
    filter: IprofileData,
    update: UpdateQuery<User>
  ): Promise<User | null> {
    return await this.userModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }
}
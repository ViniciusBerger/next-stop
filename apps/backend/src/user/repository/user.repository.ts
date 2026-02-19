import { Injectable } from "@nestjs/common";
import { User } from "../user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery} from "mongoose";
import { IuserData } from "./IuserData";

 
@Injectable()
export class UserRepository {
    // Uses shorthand assignment; removed 'userModel' private property declaration.
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    // Simple wrapper for document creation. 
    async create(data: Partial<User>): Promise<User> {
        return await new this.userModel(data).save();
    }

    // Generic find; logic for which field to query belongs in the Service.
    async findOne(filter: IuserData): Promise<User | null> {
        return await this.userModel.findOne(filter).exec();
    }

    // Atomic update using Mongoose $operators; returns null if not found. */
    async update(filter: IuserData, update: UpdateQuery<User>): Promise<User | null> {
        return await this.userModel.findOneAndUpdate(filter, update, { new: true }).exec();
    }

    // Hard delete; Service decides if this is allowed based on business rules.
    async delete(filter: IuserData): Promise<User | null> {
        return await this.userModel.findOneAndDelete(filter).exec();
    }
}
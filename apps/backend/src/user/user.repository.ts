import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { Model } from "mongoose";

@Injectable()
export class UserRepository {
    private userModel: Model<User>;

    constructor(@InjectModel(User.name) userModelReceived: Model<User>) {
        this.userModel = userModelReceived;
    }

    async createUser(user: CreateUserDTO): Promise<User> {
        const newUser = new this.userModel(user);
        return await newUser.save(); 
    }

    async findOne(query: any): Promise<User | null> {
        const userReceived = await this.userModel.findOne(query).exec();
        return userReceived;
    }

    async updateUser(firebaseUid: string, query: any): Promise<User | null> {
        const updatedUser = await this.userModel.findOneAndUpdate(
            { firebaseUid: firebaseUid }, 
            { $set: query }, 
            { new: true }
        ).exec();
        return updatedUser;
    }

    async deleteUser(firebaseUid: string) {
        const deletedUser = await this.userModel.findOneAndDelete({ firebaseUid: firebaseUid }).exec();
        return deletedUser;
    }

    async save(user: User): Promise<User> {
        return await user.save();
    }

    async populate(user: User, options: any): Promise<User> {
        return await user.populate(options);
    }
}
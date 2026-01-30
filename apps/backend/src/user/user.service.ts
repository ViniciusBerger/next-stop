import { Injectable } from "@nestjs/common";
import { UserSchema } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserService {
    private userModel: Model<UserSchema>;

    constructor(@InjectModel(UserSchema.name) userModelReceived: Model<UserSchema>) {
        this.userModel = userModelReceived;
    }

    // ADD VALIDATION 
    addUser(user: UserSchema): boolean {
        const newUser = new this.userModel(user);
        newUser.save();

        return true;
    }

    // return userSchema or null 
    getUser(userId: string): Promise<UserSchema | null> {

        const userReceived = async () => await this.userModel.findById(userId).exec();

        return userReceived();
    }

    
}
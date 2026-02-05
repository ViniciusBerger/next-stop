import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { Model } from "mongoose";



@Injectable()
export class UserRepository {
    private userModel: Model<User>;

    // inject model for user
    constructor(@InjectModel(User.name) userModelReceived: Model<User>) {
        this.userModel = userModelReceived;
    }
 

    // add user to database
    async createUser(user: CreateUserDTO): Promise<User> {
        
        const newUser = new this.userModel(user);
        // await confirmation from the database
        return await newUser.save(); 
    }


    async findOne(query: any): Promise<User | null> {
        // consult database
        const userReceived = await this.userModel.findOne(query).exec();
        return userReceived;
    }


    async updateUser(firebaseUid: string ,query: any): Promise<User | null> {
        //find and update user
        const updatedUser = await this.userModel.findOneAndUpdate({firebaseUid: firebaseUid}, {$set: query}, {new: true}).exec();
        
        return updatedUser;
    }


    async deleteUser(firebaseUid: string) {
        const deletedUser = await this.userModel.findOneAndDelete({ firebaseUid:firebaseUid}).exec();
        return deletedUser;
    }

    
}
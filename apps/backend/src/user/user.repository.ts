import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { GetUserDTO } from "./DTOs/get.user.DTO";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { EditUserDTO } from "./DTOs/edit.user.DTO";



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


    getUser(query: any): Promise<User | null> {
        // consult database
        const userReceived = async () => await this.userModel.findOne(query).exec();
        return userReceived();
    }


    editUser(_id: string ,query: any): Promise<User | null> {
        //find and update user
        const updatedUser = async () => await this.userModel.findOneAndUpdate({_id: _id}, {$set: query}, {new: true} ).exec();
        
        return updatedUser();
    }


    deleteUser(_id: string) {
        const deletedUser = async ()=> await this.userModel.findOneAndDelete({ _id:_id}).exec();

        return deletedUser();
    }

    
}
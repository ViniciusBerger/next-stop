import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { GetUserDTO } from "./DTOs/getUser.DTO";
import { CreateUserDTO } from "./DTOs/createUserDTO";


@Injectable()
export class UserService {
    private userModel: Model<User>;

    // inject model for user
    constructor(@InjectModel(User.name) userModelReceived: Model<User>) {
        this.userModel = userModelReceived;
    }
 
    
    // add user to database
    addUser(user: CreateUserDTO): boolean {
        const newUser = new this.userModel(user);
        newUser.save();

        return true;
    }

    // return userSchema or null 
    getUser(getUserDTO: GetUserDTO): Promise<User | null> {
        const { firebaseUid, username} = getUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if(username) mongoQuery.username = username;


        const userReceived = async () => await this.userModel.findOne(mongoQuery).exec();

        return userReceived();
    }

    
}
import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { GetUserDTO } from "./DTOs/get.user.DTO";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { EditUserDTO } from "./DTOs/edit.user.DTO";


@Injectable()
export class UserService {
    private userModel: Model<User>;

    // inject model for user
    constructor(@InjectModel(User.name) userModelReceived: Model<User>) {
        this.userModel = userModelReceived;
    }
 
    // add user to database
    async addUser(user: CreateUserDTO){
        
        const newUser = new this.userModel(user);
        return await newUser.save(); // Wait for the DB to confirm 
    }

    getUser(getUserDTO: GetUserDTO): Promise<User | null> {
        //getUserDTO destructuring
        const { firebaseUid, username} = getUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if(username) mongoQuery.username = username;

        // consult database
        const userReceived = async () => await this.userModel.findOne(mongoQuery).exec();
        return userReceived();
    }

    editUser(editUserDTO: EditUserDTO) {
        //editUserDTO destructuring
        const { _id, username, bio, profilePicture} = editUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(username) mongoQuery.username = username;
        if (bio) mongoQuery.bio = bio;
        if (profilePicture) mongoQuery.profilePicture = profilePicture;

        //find and update user
        const updatedUser = async () => await this.userModel.findOneAndUpdate({_id: _id}, {$set: mongoQuery}, ).exec();
        return updatedUser();
    }

    
}
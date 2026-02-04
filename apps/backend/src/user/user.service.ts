import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import FilterQuery from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { GetUserDTO } from "./DTOs/get.user.DTO";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { EditUserDTO } from "./DTOs/edit.user.DTO";



@Injectable()
export class UserService {
    private userRepository: any;

    // inject User repository 
    constructor(@InjectModel(User.name) userRepositoryReceived: User) {
        this.userRepository = userRepositoryReceived;
    }
 
    
    async addUser(user: CreateUserDTO){
        // add user to database
        const newUser = await this.userRepository.create(user);
        return newUser();
    }


    async getUser(getUserDTO: GetUserDTO): Promise<User | null> {
        //getUserDTO destructuring
        const { firebaseUid, username} = getUserDTO;
        const mongoQuery: any = {};


        // dictionary for mongo query
        if(firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if(username) mongoQuery.username = username;


        // consult database
        const userReceived = await this.userRepository.findOne(mongoQuery).exec();
        return userReceived();
    }


    async editUser(editUserDTO: EditUserDTO) {
        //editUserDTO destructuring
        const { _id, username, bio, profilePicture} = editUserDTO;
        const mongoQuery: any = {};


        // dictionary for mongo query
        if(username) mongoQuery.username = username;
        if (bio) mongoQuery.bio = bio;
        if (profilePicture) mongoQuery.profilePicture = profilePicture;


        //find and update user
        const updatedUser = await this.userRepository.editUser(_id, mongoQuery)
        return updatedUser();
    }

    
    async deleteUser(_id: string) {
        const deletedUser = await this.userRepository.findOneAndDelete({_id: _id}).exec();
        return deletedUser();
    }

    
}
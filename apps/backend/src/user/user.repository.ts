import {Injectable, NotFoundException } from "@nestjs/common";
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
        const userFound = await this.userModel.findOne(query).exec();
        if (!userFound) throw new NotFoundException("The user you are tring to find does not exist")
        
        return userFound;
    }


    async updateUser(firebaseUid: string ,query: any): Promise<User | null> {
        const updatedUser = await this.userModel.findOneAndUpdate({firebaseUid: firebaseUid}, {$set: query}, {new: true}).exec();
        
        if (!updatedUser) throw new NotFoundException("The user you are trying to update does not exist")
        
        return updatedUser;
    }


    async deleteUser(firebaseUid: string):Promise<User | null>{
        const deletedUser = await this.userModel.findOneAndDelete({ firebaseUid:firebaseUid}).exec();
        if (!deletedUser) throw new NotFoundException("The user you are trying to delete does not exist")
        
        return deletedUser;
    }

    async addFriend(requesterUid: string, friendUid: string){
        const friend = await this.userModel.findOne({firebaseUid: friendUid})
        if (!friend) throw new NotFoundException("The user you are trying to add does not exist")

        const [addResult] = await Promise.all([
        this.userModel.updateOne({ firebaseUid: requesterUid },{ $addToSet: {friends: friendUid }}).exec(),
        this.userModel.updateOne({ firebaseUid: friendUid },{ $addToSet: { friends: requesterUid }}).exec()]);

        if (!addResult) throw new NotFoundException("The user you are trying to add does not exist")
        
        return {
            success: addResult.modifiedCount > 0, 
            message: addResult.modifiedCount > 0? "friend added successfully": "Could not add friend"
        }
    }

    async deleteFriend(requesterUid: string, friendUid: string) {
        const [deleteResult] = await Promise.all([
            this.userModel.collection.updateOne({firebaseUid: requesterUid}, {$pull: {friends: friendUid} as any}),
            this.userModel.collection.updateOne({firebaseUid: friendUid}, {$pull: {friends: requesterUid} as any})
        ])

        return {
            success: deleteResult.modifiedCount > 0, 
            message: deleteResult.modifiedCount > 0? "friend deleted successfully": "Friend not found"
        }
        
    }
    
}
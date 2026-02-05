import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetUserDTO } from "./DTOs/get.user.DTO";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { EditUserDTO } from "./DTOs/edit.user.DTO";
import { UserRepository } from "./user.repository";
import { DeleteUserDTO } from "./DTOs/delete.user.DTO";



@Injectable()
export class UserService {
    private userRepository: any;

    // inject User repository 
    constructor(private readonly userRepositoryReceived: UserRepository) {
        this.userRepository = userRepositoryReceived;
    }
 
    
    async createUser(user: CreateUserDTO){
        // add user to database
        const newUser = await this.userRepository.createUser(user);
        return newUser;
    }


    async getUser(getUserDTO: GetUserDTO): Promise<User | null> {
        //getUserDTO destructuring
        const { firebaseUid, username} = getUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if(username) mongoQuery.username = username;


        if (Object.keys(mongoQuery).length === 0) throw new BadRequestException('Please provide the valid user params');

        // consult database
        const userReceived = await this.userRepository.findOne(mongoQuery);
        return userReceived;
    }


    async updateUser(editUserDTO: EditUserDTO) {
        //editUserDTO destructuring
        const { firebaseUid, username, bio, profilePicture} = editUserDTO;
        const mongoQuery: any = {};


        // dictionary for mongo query
        if(username) mongoQuery.username = username;
        if (bio) mongoQuery.bio = bio;
        if (profilePicture) mongoQuery.profilePicture = profilePicture;


        //find and update user
        const updatedUser = await this.userRepository.updateUser(firebaseUid, mongoQuery)
        return updatedUser;
    }

    async deleteUser(deleteUserDTO: DeleteUserDTO) {
        const deletedUser = await this.userRepository.deleteUser(deleteUserDTO);
        return deletedUser;
    }

    
}
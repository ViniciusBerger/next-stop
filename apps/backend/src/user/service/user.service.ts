import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { UserRepository } from "../user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { FriendRequestDTO } from "../DTOs/friend.request";



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
        const {firebaseUid, username} = getUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if(username) mongoQuery.username = username;

        // consult database
        const userReceived = await this.userRepository.findOne(mongoQuery);
        return userReceived;
    }


    async updateUser(editUserDTO: UpdateUserDTO) {
        //editUserDTO destructuring
        const { firebaseUid, username} = editUserDTO;
        const mongoQuery: any = {};

        // dictionary for mongo query
        if(username) mongoQuery.username = username;
        

        //find and update user
        const updatedUser = await this.userRepository.updateUser(firebaseUid, mongoQuery)
        return updatedUser;
    }

    async deleteUser(deleteUserDTO: DeleteUserDTO) {
        const deletedUser = await this.userRepository.deleteUser(deleteUserDTO);
        return deletedUser;
    }

    async handleFriendRequest(userUid:string, friendRequestDTO: FriendRequestDTO) {
        const response = await this.userRepository.addFriend(userUid, friendRequestDTO.friendUid)
        
        if (!response.success) throw new BadRequestException(response.message)
        return response;
        
    }

    async handleFriendDelete(userUid: string, targetUid: string) {
        const response = await this.userRepository.deleteFriend(userUid, targetUid)
        
        if (!response.success) throw new BadRequestException(response.message)
        return response;
    }
}
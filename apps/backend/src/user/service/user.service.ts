import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { UserRepository } from "../repository/user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { FriendRequestDTO } from "../DTOs/friend.request";

@Injectable()
export class UserService {
    // 'private readonly' automatically assigns the injected repository.
    constructor(private readonly userRepository: UserRepository) {}
 
    // Persists a new user; delegate the data to generic repository.
    async createUser(dto: CreateUserDTO): Promise<User> {
        return await this.userRepository.create(dto);
    }

    // Translates GetUserDTO into a search filter, prioritizing firebaseUid.
    async findOne(dto: GetUserDTO): Promise<User | null> {
        const { firebaseUid, username } = dto;
        const filter = firebaseUid ? { firebaseUid } : { username };

        const user = await this.userRepository.findOne(filter);
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    // Update one user attribute; extracts the unique ID to build the repository filter.
    async updateUser(requirerUid: string, updateData: UpdateUserDTO) {
        
        const updatedUser = await this.userRepository.update({ firebaseUid: requirerUid }, { $set: updateData });
        if (!updatedUser) throw new NotFoundException("User to update not found");
        return updatedUser;
    }

    // Handles account deletion by the generic delete method. 
    async deleteUser(dto: DeleteUserDTO) {
        const deletedUser = await this.userRepository.delete({ firebaseUid: dto.firebaseUid });
        if (!deletedUser) throw new NotFoundException("User to delete not found");
        return deletedUser;
    }

    /** 
     *  Business Logic: Orchestrates a bidirectional friendship link.
     *  Uses Promise.all to ensure updates happen in parallel processing.
     */
    async handleFriendRequest(userUid: string, dto: FriendRequestDTO) {
        if (userUid === dto.friendUid) throw new BadRequestException("Cannot set friendship");

        const [user, friend] = await Promise.all([
            this.userRepository.update({ firebaseUid: userUid }, { $addToSet: { friends: dto.friendUid } }),
            this.userRepository.update({ firebaseUid: dto.friendUid }, { $addToSet: { friends: userUid } })
        ]);

        if (!user || !friend) throw new NotFoundException("One or both users do not exist");
        return { success: true, message: "Friend added successfully" };
    }

    // removal of friendship references from both user's friends list. 
    async handleFriendDelete(userUid: string, targetUid: string) {
        const results = await Promise.all([
            this.userRepository.update({ firebaseUid: userUid }, { $pull: { friends: targetUid } }),
            this.userRepository.update({ firebaseUid: targetUid }, { $pull: { friends: userUid } })
        ]);

        if (!results[0] || !results[1]) {
        throw new NotFoundException("One or both users do not exist");
        }

        return { success: true, message: "Friendship removed" };
    }
}
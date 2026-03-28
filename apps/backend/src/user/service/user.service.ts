import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { UserRepository } from "../repository/user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { FriendRequestDTO } from "../DTOs/friend.request";
import { Types } from "mongoose";

@Injectable()
export class UserService {
    // 'private readonly' automatically assigns the injected repository.
    constructor(private readonly userRepository: UserRepository) {}
 
    // Persists a new user; delegate the data to generic repository.
    async createUser(dto: CreateUserDTO): Promise<User> {
        return await this.userRepository.create(dto);
    }

    async getAll():Promise<User[]> {
        return await this.userRepository.findAll();
    }

    // Translates GetUserDTO into a search filter, searching by firebaseUid.
    async findById(dto: GetUserDTO): Promise<User | null> {
        const { firebaseUid } = dto;

        const user = await this.userRepository.findOne({firebaseUid: firebaseUid});
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    // Translates GetUserDTO into a search filter, searching by username.
    async findByUsername(dto: GetUserDTO): Promise<User | null> {
        const { username } = dto;

        const user = await this.userRepository.findOne({username: username});
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


    async banUser(firebaseUid: string, reason?: string): Promise<User> {
        const user = await this.userRepository.update(
            { firebaseUid },
            { $set: { isBanned: true, bannedAt: new Date(), banReason: reason ?? null, isSuspended: false, suspendedUntil: null } },
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async unbanUser(firebaseUid: string): Promise<User> {
        const user = await this.userRepository.update(
            { firebaseUid },
            { $set: { isBanned: false, bannedAt: null, banReason: null } },
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async suspendUser(firebaseUid: string, days: number, reason?: string): Promise<User> {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + days);
        const user = await this.userRepository.update(
            { firebaseUid },
            { $set: { isSuspended: true, suspendedUntil, banReason: reason ?? null } },
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async unsuspendUser(firebaseUid: string): Promise<User> {
        const user = await this.userRepository.update(
            { firebaseUid },
            { $set: { isSuspended: false, suspendedUntil: null, banReason: null } },
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async savePushToken(firebaseUid: string, expoPushToken: string): Promise<User> {
        const user = await this.userRepository.update(
            { firebaseUid },
            { $set: { expoPushToken } },
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ email });
    }

    async findByEmailString(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ email });
    }

    async findByUsernameString(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ username });
    }

    async toggleArrayField(userId: string, field: 'wishlist' | 'favorites', placeId: string) {
        console.log('🔍 Looking for firebaseUid:', userId);
        const objectId = new Types.ObjectId(placeId);

        const user = await this.userRepository.findOne({ firebaseUid: userId });
        console.log('👤 User found:', user ? 'YES' : 'NULL');
        if (!user) throw new NotFoundException("User not found");

        const index = user[field].findIndex((id: Types.ObjectId) => id.equals(objectId));
        if (index > -1) {
            user[field].splice(index, 1); // Remove
        } else {
            user[field].push(objectId); // Add
        }

        return await this.userRepository.update(
            { firebaseUid: userId },
            { $set: { [field]: user[field] } }
        );
    }

    async getArrayField(userId: string, field: 'wishlist' | 'favorites') {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException("User not found");
    await user.populate(field);
    return user[field];
    }

}
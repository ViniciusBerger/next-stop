import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { UserRepository } from "../user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { AddFriendDTO } from "../DTOs/add.friend.DTO";

@Injectable()
export class UserService {
    private userRepository: any;

    constructor(private readonly userRepositoryReceived: UserRepository) {
        this.userRepository = userRepositoryReceived;
    }
 
    async createUser(user: CreateUserDTO) {
        const newUser = await this.userRepository.createUser(user);
        return newUser;
    }

    async getUser(getUserDTO: GetUserDTO): Promise<User | null> {
        const { firebaseUid, username } = getUserDTO;
        const mongoQuery: any = {};

        if (firebaseUid) mongoQuery.firebaseUid = firebaseUid;
        if (username) mongoQuery.username = username;

        if (Object.keys(mongoQuery).length === 0) {
            throw new BadRequestException('Please provide valid user params');
        }

        const userReceived = await this.userRepository.findOne(mongoQuery);
        return userReceived;
    }

    async updateUser(editUserDTO: EditUserDTO) {
        const { firebaseUid, username, bio, profilePicture } = editUserDTO;
        const mongoQuery: any = {};

        if (username) mongoQuery.username = username;
        if (bio) mongoQuery.bio = bio;
        if (profilePicture) mongoQuery.profilePicture = profilePicture;

        const updatedUser = await this.userRepository.updateUser(firebaseUid, mongoQuery);
        return updatedUser;
    }

    async deleteUser(deleteUserDTO: DeleteUserDTO) {
        const deletedUser = await this.userRepository.deleteUser(deleteUserDTO);
        return deletedUser;
    }

    // ============== FAVORITES ==============

    async addToFavorites(userId: string, placeId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const alreadyFavorited = user.favorites.some(
            (id: any) => id.toString() === placeId
        );

        if (alreadyFavorited) {
            throw new BadRequestException('Place already in favorites');
        }

        user.favorites.push(placeId as any);
        return await this.userRepository.save(user);
    }

    async getFavorites(userId: string) {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const populatedUser = await this.userRepository.populate(user, {
            path: 'favorites',
            select: 'name address category customImages averageUserRating'
        });

        return populatedUser.favorites;
    }

    async removeFromFavorites(userId: string, placeId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.favorites = user.favorites.filter(
            (id: any) => id.toString() !== placeId
        );

        return await this.userRepository.save(user);
    }

    // ============== WISHLIST ==============

    async addToWishlist(userId: string, placeId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const alreadyInWishlist = user.wishlist.some(
            (id: any) => id.toString() === placeId
        );

        if (alreadyInWishlist) {
            throw new BadRequestException('Place already in wishlist');
        }

        user.wishlist.push(placeId as any);
        return await this.userRepository.save(user);
    }

    async getWishlist(userId: string) {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const populatedUser = await this.userRepository.populate(user, {
            path: 'wishlist',
            select: 'name address category customImages averageUserRating'
        });

        return populatedUser.wishlist;
    }

    async removeFromWishlist(userId: string, placeId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.wishlist = user.wishlist.filter(
            (id: any) => id.toString() !== placeId
        );

        return await this.userRepository.save(user);
    }

    // ============== ADMIN - BAN ==============

    async banUser(userId: string, reason?: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isBanned = true;
        user.bannedAt = new Date();
        user.banReason = reason || 'No reason provided';

        return await this.userRepository.save(user);
    }

    async unbanUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isBanned = false;
        user.bannedAt = undefined;
        user.banReason = undefined;

        return await this.userRepository.save(user);
    }

    // ============== ADMIN - SUSPEND ==============

    async suspendUser(userId: string, suspendedUntil: Date, reason?: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isSuspended = true;
        user.suspendedUntil = suspendedUntil;
        user.banReason = reason || 'No reason provided';

        return await this.userRepository.save(user);
    }

    async unsuspendUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ firebaseUid: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isSuspended = false;
        user.suspendedUntil = undefined;
        user.banReason = undefined;

        return await this.userRepository.save(user);
    }
}
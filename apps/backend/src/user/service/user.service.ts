import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { UserRepository } from "../repository/user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
<<<<<<< HEAD
import * as crypto from 'crypto';

@Injectable()
export class UserService {
    private userRepository: any;

    // inject User repository 
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

        if (Object.keys(mongoQuery).length === 0)
            throw new BadRequestException('Please provide the valid user params');

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
=======
import { FriendRequestDTO } from "../DTOs/friend.request";

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
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711
        return updatedUser;
    }

    // Handles account deletion by the generic delete method. 
    async deleteUser(dto: DeleteUserDTO) {
        const deletedUser = await this.userRepository.delete({ firebaseUid: dto.firebaseUid });
        if (!deletedUser) throw new NotFoundException("User to delete not found");
        return deletedUser;
    }

<<<<<<< HEAD
    // ==============================
    // ✅ EMAIL VERIFICATION FLOW
    // ==============================

    async sendEmailVerification(firebaseUid: string) {
        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const updatedUser = await this.userRepository.updateUser(firebaseUid, {
            emailVerified: false,
            verificationToken: token,
            tokenExpiresAt: expiresAt,
        });

        if (!updatedUser) {
            throw new BadRequestException('User not found');
        }

        // Email sending (Firebase or other service can be plugged in here)
        return {
            message: 'Verification token generated',
            token: token,
        };
    }

    async verifyEmailToken(token: string) {
        const user = await this.userRepository.findOne({
            verificationToken: token,
            tokenExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        const updatedUser = await this.userRepository.updateUser(user.firebaseUid, {
            emailVerified: true,
            verificationToken: null,
            tokenExpiresAt: null,
        });

        return {
            message: 'Email verified successfully',
            user: updatedUser,
        };
    }
}
=======
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


    async banUser(id: string){
        const userBanned = await this.updateUser(id, {isBanned: true}) 

        if(!userBanned.isBanned) throw new InternalServerErrorException("error banning user.")
        
        return userBanned
    }

    async unbanUser(id: string){
        const user = await this.updateUser(id, {isBanned: false}) 

        if(user.isBanned) throw new InternalServerErrorException("error unbanning user.")
        
        return user
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

}
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

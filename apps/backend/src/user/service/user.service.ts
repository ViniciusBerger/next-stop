import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { EditUserDTO } from "../DTOs/edit.user.DTO";
import { UserRepository } from "../user.repository";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
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
        return updatedUser;
    }

    async deleteUser(deleteUserDTO: DeleteUserDTO) {
        const deletedUser = await this.userRepository.deleteUser(deleteUserDTO);
        return deletedUser;
    }

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

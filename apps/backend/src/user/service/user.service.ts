import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { GetUserDTO } from '../DTOs/get.user.DTO';
import { CreateUserDTO } from '../DTOs/create.user.DTO';
import { EditUserDTO } from '../DTOs/edit.user.DTO';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(user: CreateUserDTO) {
    return this.userRepository.createUser(user);
  }

  async getUser(getUserDTO: GetUserDTO): Promise<User | null> {
    const { firebaseUid, username } = getUserDTO;
    const query: any = {};
    if (firebaseUid) query.firebaseUid = firebaseUid;
    if (username) query.username = username;

    if (Object.keys(query).length === 0) {
      throw new BadRequestException('Please provide valid user params');
    }

    return this.userRepository.findOne(query);
  }

  async updateUser(dto: EditUserDTO) {
    const { firebaseUid, username, bio, profilePicture } = dto;
    if (!firebaseUid) {
      throw new BadRequestException('firebaseUid is required');
    }

    const update: any = {};
    if (username !== undefined) update.username = username?.trim();
    if (bio !== undefined) update.bio = bio?.trim();
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const updated = await this.userRepository.updateUser(firebaseUid, update);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async deleteUser(firebaseUid: string) {
    if (!firebaseUid) throw new BadRequestException('firebaseUid is required');
    return this.userRepository.deleteUser(firebaseUid);
  }

  // ---------- Helpers ----------
  private assertValidObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid placeId');
    }
  }

  // ============== FAVORITES ==============

  async addToFavorites(userId: string, placeId: string): Promise<User> {
    this.assertValidObjectId(placeId);

    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    const exists = user.favorites.some(
      (id: any) => id.toString() === placeId,
    );
    if (exists) throw new BadRequestException('Place already in favorites');

    user.favorites.push(placeId as any);
    return this.userRepository.save(user);
  }

  async getFavorites(userId: string) {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    const populated = await this.userRepository.populate(user, {
      path: 'favorites',
      select: 'name address category customImages averageUserRating',
    });
    return populated.favorites;
  }

  async removeFromFavorites(userId: string, placeId: string): Promise<User> {
    this.assertValidObjectId(placeId);

    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.favorites = user.favorites.filter(
      (id: any) => id.toString() !== placeId,
    );
    return this.userRepository.save(user);
  }

  // ============== WISHLIST ==============

  async addToWishlist(userId: string, placeId: string): Promise<User> {
    this.assertValidObjectId(placeId);

    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    const exists = user.wishlist.some(
      (id: any) => id.toString() === placeId,
    );
    if (exists) throw new BadRequestException('Place already in wishlist');

    user.wishlist.push(placeId as any);
    return this.userRepository.save(user);
  }

  async getWishlist(userId: string) {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    const populated = await this.userRepository.populate(user, {
      path: 'wishlist',
      select: 'name address category customImages averageUserRating',
    });
    return populated.wishlist;
  }

  async removeFromWishlist(userId: string, placeId: string): Promise<User> {
    this.assertValidObjectId(placeId);

    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.wishlist = user.wishlist.filter(
      (id: any) => id.toString() !== placeId,
    );
    return this.userRepository.save(user);
  }

  // ============== ADMIN - BAN/SUSPEND ==============

  async banUser(userId: string, reason?: string): Promise<User> {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason || 'No reason provided';
    return this.userRepository.save(user);
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.isBanned = false;
    user.bannedAt = undefined;
    user.banReason = undefined;
    return this.userRepository.save(user);
  }

  async suspendUser(
    userId: string,
    suspendedUntil: Date,
    reason?: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.isSuspended = true;
    user.suspendedUntil = suspendedUntil;
    user.suspensionReason = reason || 'No reason provided';
    return this.userRepository.save(user);
  }

  async unsuspendUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ firebaseUid: userId });
    if (!user) throw new NotFoundException('User not found');

    user.isSuspended = false;
    user.suspendedUntil = undefined;
    user.suspensionReason = undefined;
    return this.userRepository.save(user);
  }
}
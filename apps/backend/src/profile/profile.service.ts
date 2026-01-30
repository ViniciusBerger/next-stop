import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchema } from '../user/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('User') private userModel: Model<UserSchema>,
  ) {}

    async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
        // TO BE FINISHED - user's data
    };
  }

    async updateProfile(userId: string, updateData: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { 'profile.privacy': updateData.privacy } },
      { new: true, runValidators: true }
    ).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      message: 'Profile updated successfully',
      profile: user.profile,
    };
  }
}
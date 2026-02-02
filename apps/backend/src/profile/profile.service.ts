import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { GetProfileDTO } from './DTOs/get.profile.DTO';
import { UpdateProfileDTO } from './DTOs/update.profile.DTO';

@Injectable()
export class ProfileService {
  private userModel: Model<User>;

  constructor(@InjectModel(User.name) userModelReceived: Model<User>) {
    this.userModel = userModelReceived;
  }

  // GET profile by firebaseUid or username
  async getProfile(getProfileDTO: GetProfileDTO): Promise<User | null> {
    // Destructuring do DTO
    const { firebaseUid, username } = getProfileDTO;
    const mongoQuery: any = {};

    // Building MongoDB's query
    if (firebaseUid) mongoQuery.firebaseUid = firebaseUid;
    if (username) mongoQuery.username = username;

    // Consulting DB
    const user = await this.userModel.findOne(mongoQuery).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // PUT/UPDATE profile (preferences e privacy)
  async updateProfile(
    getProfileDTO: GetProfileDTO,
    updateProfileDTO: UpdateProfileDTO,
  ): Promise<User | null> {
    // Destructuring to identify user by firebaseUid or username
    const { firebaseUid, username } = getProfileDTO;
    const mongoQuery: any = {};

    if (firebaseUid) mongoQuery.firebaseUid = firebaseUid;
    if (username) mongoQuery.username = username;

    // Building object for update
    const updateData: any = {};

    if (updateProfileDTO.preferences) {
      if (updateProfileDTO.preferences.cuisine !== undefined) {
        updateData['profile.preferences.cuisine'] = updateProfileDTO.preferences.cuisine;
      }
      if (updateProfileDTO.preferences.dietaryLabels !== undefined) {
        updateData['profile.preferences.dietaryLabels'] = updateProfileDTO.preferences.dietaryLabels;
      }
      if (updateProfileDTO.preferences.allergies !== undefined) {
        updateData['profile.preferences.allergies'] = updateProfileDTO.preferences.allergies;
      }
      if (updateProfileDTO.preferences.activities !== undefined) {
        updateData['profile.preferences.activities'] = updateProfileDTO.preferences.activities;
      }
    }

    if (updateProfileDTO.privacy) {
      if (updateProfileDTO.privacy.activityFeed !== undefined) {
        updateData['profile.privacy.activityFeed'] = updateProfileDTO.privacy.activityFeed;
      }
      if (updateProfileDTO.privacy.favorites !== undefined) {
        updateData['profile.privacy.favorites'] = updateProfileDTO.privacy.favorites;
      }
      if (updateProfileDTO.privacy.myEvents !== undefined) {
        updateData['profile.privacy.myEvents'] = updateProfileDTO.privacy.myEvents;
      }
      if (updateProfileDTO.privacy.badges !== undefined) {
        updateData['profile.privacy.badges'] = updateProfileDTO.privacy.badges;
      }
      if (updateProfileDTO.privacy.preferences !== undefined) {
        updateData['profile.privacy.preferences'] = updateProfileDTO.privacy.preferences;
      }
    }

    // Update updatedAt
    updateData.updatedAt = new Date();

    // Run update
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        mongoQuery,
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
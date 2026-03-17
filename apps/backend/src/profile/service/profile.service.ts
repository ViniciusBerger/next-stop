import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repository/profile.repository';
import { GetProfileDTO } from '../DTOs/get.profile.DTO';
import { UpdateProfileDTO } from '../DTOs/update.profile.DTO';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(dto: GetProfileDTO): Promise<User> {
    const { firebaseUid, username } = dto;
    const filter: any = {};

    if (firebaseUid) filter.firebaseUid = firebaseUid;
    if (username) filter.username = username;

    const user = await this.profileRepository.findOne(filter);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    getDto: GetProfileDTO,
    updateDto: UpdateProfileDTO
  ): Promise<User> {
    const { firebaseUid, username } = getDto;
    const filter: any = {};

    if (firebaseUid) filter.firebaseUid = firebaseUid;
    if (username) filter.username = username;

    // Build update object
    const updateData: any = {};

    if (updateDto.preferences) {
      if (updateDto.preferences.cuisine !== undefined) {
        updateData['profile.preferences.cuisine'] = updateDto.preferences.cuisine;
      }
      if (updateDto.preferences.dietaryLabels !== undefined) {
        updateData['profile.preferences.dietaryLabels'] = updateDto.preferences.dietaryLabels;
      }
      if (updateDto.preferences.allergies !== undefined) {
        updateData['profile.preferences.allergies'] = updateDto.preferences.allergies;
      }
      if (updateDto.preferences.activities !== undefined) {
        updateData['profile.preferences.activities'] = updateDto.preferences.activities;
      }
    }

    if (updateDto.privacy) {
      if (updateDto.privacy.activityFeed !== undefined) {
        updateData['profile.privacy.activityFeed'] = updateDto.privacy.activityFeed;
      }
      if (updateDto.privacy.favorites !== undefined) {
        updateData['profile.privacy.favorites'] = updateDto.privacy.favorites;
      }
      if (updateDto.privacy.myEvents !== undefined) {
        updateData['profile.privacy.myEvents'] = updateDto.privacy.myEvents;
      }
      if (updateDto.privacy.badges !== undefined) {
        updateData['profile.privacy.badges'] = updateDto.privacy.badges;
      }
      if (updateDto.privacy.preferences !== undefined) {
        updateData['profile.privacy.preferences'] = updateDto.privacy.preferences;
      }
    }

    updateData.updatedAt = new Date();

    const updatedUser = await this.profileRepository.update(filter, { $set: updateData });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
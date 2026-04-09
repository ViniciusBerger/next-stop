import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  Query,
} from '@nestjs/common';
import { ProfileService } from '../service/profile.service';
import { GetProfileDTO } from '../DTOs/get.profile.DTO';
import { UpdateProfileDTO } from '../DTOs/update.profile.DTO';
import { ProfileResponseDTO } from '../DTOs/profile.response.DTO';
import { plainToInstance } from 'class-transformer';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET profile
  @Get()
  async getProfile(@Query() getProfileDTO: GetProfileDTO) {

    const hasValues = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasValues) {
      throw new BadRequestException(
        'Please provide firebaseUid or username',
      );
    }

    const user = await this.profileService.getProfile(getProfileDTO);

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return plainToInstance(ProfileResponseDTO, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // UPDATE profile
  @Put()
  async updateProfile(
    @Query() getProfileDTO: GetProfileDTO,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    console.log("UPDATE BODY:", updateProfileDTO);

    const hasIdentifier = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasIdentifier) {
      throw new BadRequestException(
        'Please provide firebaseUid or username',
      );
    }

    // REMOVE empty strings (this was causing your error)
    if (updateProfileDTO.username === '') {
      delete updateProfileDTO.username;
    }

    if (updateProfileDTO.profilePicture === '') {
      delete updateProfileDTO.profilePicture;
    }

    if (updateProfileDTO.bio === '') {
      delete updateProfileDTO.bio;
    }

    const hasUpdateData =
      updateProfileDTO.preferences !== undefined ||
      updateProfileDTO.privacy !== undefined ||
      updateProfileDTO.profilePicture !== undefined ||
      updateProfileDTO.bio !== undefined ||
      updateProfileDTO.username !== undefined;

    if (!hasUpdateData) {
      throw new BadRequestException(
        'No valid fields to update',
      );
    }

    const updatedUser = await this.profileService.updateProfile(
      getProfileDTO,
      updateProfileDTO,
    );

    if (!updatedUser) {
      throw new NotFoundException('Profile not found');
    }

    return plainToInstance(ProfileResponseDTO, updatedUser.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  Query,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetProfileDTO } from './DTOs/get.profile.DTO';
import { UpdateProfileDTO } from './DTOs/update.profile.DTO';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDTO } from './DTOs/profile.response.DTO';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Profile')

@Controller('profile')

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /profile
  @Get()

  @ApiOperation({ summary: 'Get user profile' })

  @ApiResponse({ status: 200, description: 'Profile returned successfully' })

  async getProfile(@Query() getProfileDTO: GetProfileDTO) {

    const hasValues = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasValues) {
      throw new BadRequestException(
        'Please provide a valid firebaseUid or username',
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

  // PUT /profile
  @Put()

  @ApiOperation({ summary: 'Update user profile' })

  @ApiResponse({ status: 200, description: 'Profile updated successfully' })

  async updateProfile(
    @Query() getProfileDTO: GetProfileDTO,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {

    const hasIdentifier = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasIdentifier) {
      throw new BadRequestException(
        'Please provide a valid firebaseUid or username',
      );
    }

    const hasUpdateData =
      updateProfileDTO.preferences !== undefined ||
      updateProfileDTO.privacy !== undefined;

    if (!hasUpdateData) {
      throw new BadRequestException(
        'Please provide preferences or privacy settings to update',
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
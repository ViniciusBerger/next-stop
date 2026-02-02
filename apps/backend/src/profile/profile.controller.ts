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

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /profile?firebaseUid=xxx or /profile?username=xxx
  @Get()
  async getProfile(@Query() getProfileDTO: GetProfileDTO) {
    // Validate if at least one parameter was provided
    const hasValues = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasValues) {
      throw new BadRequestException(
        'Please provide a valid firebaseUid or username',
      );
    }

    // Search profile
    const user = await this.profileService.getProfile(getProfileDTO);

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    // Return using ResponseDTO (without sensitive fields)
    return plainToInstance(ProfileResponseDTO, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // PUT /profile?firebaseUid=xxx or /profile?username=xxx
  @Put()
  async updateProfile(
    @Query() getProfileDTO: GetProfileDTO,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    // Validate if at least one parameter was provided
    const hasIdentifier = Object.values(getProfileDTO).some(
      (value) => value !== undefined && value !== '',
    );

    if (!hasIdentifier) {
      throw new BadRequestException(
        'Please provide a valid firebaseUid or username',
      );
    }

    // Validate if there is any data to update
    const hasUpdateData = 
      updateProfileDTO.preferences !== undefined ||
      updateProfileDTO.privacy !== undefined;

    if (!hasUpdateData) {
      throw new BadRequestException(
        'Please provide preferences or privacy settings to update',
      );
    }

    // Update profile
    const updatedUser = await this.profileService.updateProfile(
      getProfileDTO,
      updateProfileDTO,
    );

    if (!updatedUser) {
      throw new NotFoundException('Profile not found');
    }

    // Return using ResponseDTO
    return plainToInstance(ProfileResponseDTO, updatedUser.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
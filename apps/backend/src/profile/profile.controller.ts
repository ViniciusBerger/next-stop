import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /profile/:userId - Search for profile
  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  // PUT /profile/:userId - Update privacy settings
  @Put(':userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateData: any,
  ) {
    return this.profileService.updateProfile(userId, updateData);
  }
}

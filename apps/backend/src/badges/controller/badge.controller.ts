import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BadgeService } from '../service/badge.service';
import { BadgeCheckerService } from '../checker/badge-checker.service';
import { CreateBadgeDTO } from '../DTOs/create.badge.DTO';
import { UpdateBadgeDTO } from '../DTOs/update.badge.DTO';
import { GetBadgeDTO } from '../DTOs/get.badge.DTO';
import { plainToInstance } from 'class-transformer';
import { BadgeResponseDTO } from '../DTOs/badge.response.DTO';

@Controller('badges')
export class BadgeController {
  constructor(
    private readonly badgeService: BadgeService,
    private readonly badgeCheckerService: BadgeCheckerService,
  ) {}

  @Post()
  async createBadge(@Body() createBadgeDTO: CreateBadgeDTO) {
    const newBadge = await this.badgeService.createBadge(createBadgeDTO);
    return plainToInstance(BadgeResponseDTO, newBadge.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves all badges with optional filters
   * GET /badges
   * 👇 UPDATED - now supports userId for progress
   */
  @Get()
  async getBadges(@Query() getBadgeDTO?: GetBadgeDTO) {
    // If userId provided, return badges with progress
    if (getBadgeDTO?.userId) {
      return await this.badgeService.getBadgesWithProgress(getBadgeDTO.userId);
    }

    const badges = await this.badgeService.getAllBadges(getBadgeDTO);
    return badges.map(badge =>
      plainToInstance(BadgeResponseDTO, badge.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('stats')
  async getBadgeStats() {
    return await this.badgeService.getBadgeStats();
  }

  @Get(':badgeId')
  async getBadge(@Param('badgeId') badgeId: string) {
    const badge = await this.badgeService.getBadge(badgeId);
    return plainToInstance(BadgeResponseDTO, badge.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Put(':badgeId')
  async updateBadge(
    @Param('badgeId') badgeId: string,
    @Body() updateBadgeDTO: UpdateBadgeDTO,
  ) {
    const updatedBadge = await this.badgeService.updateBadge(badgeId, updateBadgeDTO);
    return plainToInstance(BadgeResponseDTO, updatedBadge.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':badgeId')
  async deleteBadge(@Param('badgeId') badgeId: string) {
    return await this.badgeService.deleteBadge(badgeId);
  }

  @Post('recalculate/:userId')
  async recalculateBadges(@Param('userId') userId: string) {
    await this.badgeCheckerService.checkAllBadges(userId);
    return {
      success: true,
      message: `Badges recalculated for user ${userId}`,
    };
  }
}
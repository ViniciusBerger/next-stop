import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { BadgeService } from '../service/badge.service';
import { CreateBadgeDTO } from '../DTOs/create.badge.DTO';
import { UpdateBadgeDTO } from '../DTOs/update.badge.DTO';
import { GetBadgeDTO } from '../DTOs/get.badge.DTO';
import { plainToInstance } from 'class-transformer';
import { BadgeResponseDTO } from '../DTOs/badge.response.DTO';

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  /**
   * Creates a new badge (admin/seed only)
   * POST /badges
   * TODO: Add admin authentication middleware
   */
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
   */
  @Get()
  async getBadges(@Query() getBadgeDTO?: GetBadgeDTO) {
    const badges = await this.badgeService.getAllBadges(getBadgeDTO);

    return badges.map(badge =>
      plainToInstance(BadgeResponseDTO, badge.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Gets badge statistics
   * GET /badges/stats
   * TODO: Add admin authentication middleware
   */
  @Get('stats')
  async getBadgeStats() {
    return await this.badgeService.getBadgeStats();
  }

  /**
   * Retrieves a specific badge
   * GET /badges/:badgeId
   */
  @Get(':badgeId')
  async getBadge(@Param('badgeId') badgeId: string) {
    const badge = await this.badgeService.getBadge(badgeId);

    return plainToInstance(BadgeResponseDTO, badge.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Updates a badge (admin - usually to add iconUrl)
   * PUT /badges/:badgeId
   * TODO: Add admin authentication middleware
   */
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

  /**
   * Deletes a badge (admin only - careful!)
   * DELETE /badges/:badgeId
   * TODO: Add admin authentication middleware
   */
  @Delete(':badgeId')
  async deleteBadge(@Param('badgeId') badgeId: string) {
    return await this.badgeService.deleteBadge(badgeId);
  }
}
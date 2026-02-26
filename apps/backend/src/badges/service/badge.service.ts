import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BadgeRepository } from '../repository/badge.repository';
import { Badge } from '../schemas/badges.schema';
import { CreateBadgeDTO } from '../DTOs/create.badge.DTO';
import { UpdateBadgeDTO } from '../DTOs/update.badge.DTO';
import { GetBadgeDTO } from '../DTOs/get.badge.DTO';

@Injectable()
export class BadgeService {
  constructor(private readonly badgeRepository: BadgeRepository) {}

  /**
   * Creates a new badge (admin/seed only)
   */
  async createBadge(dto: CreateBadgeDTO): Promise<Badge> {
    // Check if badgeId already exists
    const existingBadge = await this.badgeRepository.findByBadgeId(dto.badgeId);

    if (existingBadge) {
      throw new ConflictException(`Badge with badgeId "${dto.badgeId}" already exists`);
    }

    return await this.badgeRepository.create(dto as any);
  }

  /**
   * Retrieves all badges with optional filters
   */
  async getAllBadges(dto?: GetBadgeDTO): Promise<Badge[]> {
    if (!dto) {
      return await this.badgeRepository.findAll();
    }

    const filter: any = {};

    if (dto.badgeId) filter.badgeId = dto.badgeId;
    if (dto.category) filter.category = dto.category;
    if (dto.tier) filter.tier = dto.tier;

    return await this.badgeRepository.findMany(filter);
  }

  /**
   * Retrieves a specific badge
   */
  async getBadge(badgeId: string): Promise<Badge> {
    const badge = await this.badgeRepository.findByBadgeId(badgeId);

    if (!badge) {
      throw new NotFoundException(`Badge "${badgeId}" not found`);
    }

    return badge;
  }

  /**
   * Retrieves badge by MongoDB _id
   */
  async getBadgeById(id: string): Promise<Badge> {
    const badge = await this.badgeRepository.findById(id);

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    return badge;
  }

  /**
   * Updates a badge (admin - usually to add iconUrl from designer)
   */
  async updateBadge(badgeId: string, dto: UpdateBadgeDTO): Promise<Badge> {
    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.iconUrl !== undefined) updateData.iconUrl = dto.iconUrl;
    if (dto.tier !== undefined) updateData.tier = dto.tier;

    updateData.updatedAt = new Date();

    const updatedBadge = await this.badgeRepository.update(
      { badgeId },
      { $set: updateData }
    );

    if (!updatedBadge) {
      throw new NotFoundException(`Badge "${badgeId}" not found`);
    }

    return updatedBadge;
  }

  /**
   * Deletes a badge (admin only - careful!)
   */
  async deleteBadge(badgeId: string): Promise<{ deleted: boolean; message: string }> {
    const deletedBadge = await this.badgeRepository.delete({ badgeId });

    if (!deletedBadge) {
      throw new NotFoundException(`Badge "${badgeId}" not found`);
    }

    return {
      deleted: true,
      message: `Badge "${deletedBadge.name}" deleted successfully`,
    };
  }

  /**
   * Gets badge statistics
   */
  async getBadgeStats(): Promise<{
    totalBadges: number;
    totalAwarded: number;
    byCategory: { category: string; count: number }[];
  }> {
    const allBadges = await this.badgeRepository.findAll();

    const totalBadges = allBadges.length;
    const totalAwarded = allBadges.reduce((sum, badge) => sum + badge.totalAwarded, 0);

    // Group by category
    const categoryMap = new Map<string, number>();
    allBadges.forEach(badge => {
      const count = categoryMap.get(badge.category) || 0;
      categoryMap.set(badge.category, count + 1);
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      totalBadges,
      totalAwarded,
      byCategory,
    };
  }

  /**
   * Increments totalAwarded counter (called when badge is awarded to user)
   */
  async incrementAwardedCount(badgeId: string): Promise<void> {
    await this.badgeRepository.incrementTotalAwarded(badgeId);
  }
}
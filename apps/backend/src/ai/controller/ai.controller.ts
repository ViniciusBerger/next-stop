// apps/backend/src/ai/ai.controller.ts
import { Controller, Post, Get, Delete, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AiService } from '../service/ai.service';
import { AiPickDto } from '../DTOs/ai-pick.dto';
import { AiLogService } from '../service/ai-log.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { RoleGuard } from '../../common/authorization/role.guard';
import { Roles } from '../../common/authorization/roles.decorator';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiLogService: AiLogService
  ) {}

  @Delete('logs')
  @UseGuards(FirebaseAuthGuard, RoleGuard)
  @Roles('admin')
  async clearLogs() {
    const result = await this.aiLogService.clearAllLogs();
    return { deleted: result.deletedCount };
  }

  @Get('stats')
  @UseGuards(FirebaseAuthGuard, RoleGuard)
  @Roles('admin')
  async getStats() {
    const [total, trending, daily] = await Promise.all([
      this.aiLogService.getTotalSearches(),
      this.aiLogService.getTrendingVibes(),
      this.aiLogService.getDailyUsage(7),
    ]);
    return { total, trending, daily };
  }

  @Post('pick')
  @UseGuards(FirebaseAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAiRecommendation(@Body() body: AiPickDto) {
    // 1. Check Gemini
    const recommendation = await this.aiService.pickPlace(body.vibe, body.places);

    // 2. Check Logging
    await this.aiLogService.logSearch(body.vibe, recommendation.id, body.userId);

    return recommendation;
  }
}
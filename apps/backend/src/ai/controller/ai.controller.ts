// apps/backend/src/ai/ai.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from '../service/ai.service';
import { AiPickDto } from '../DTOs/ai-pick.dto';
import { AiLogService } from '../service/ai-log.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiLogService: AiLogService 
  ) {}

  @Post('pick')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
async getAiRecommendation(@Body() body: AiPickDto) {
  try {
    console.log("🚀 AI Pick started for vibe:", body.vibe);

    // 1. Check Gemini
    const recommendation = await this.aiService.pickPlace(body.vibe, body.places);
    console.log("🤖 Gemini responded with ID:", recommendation.id);

    // 2. Check Logging
    await this.aiLogService.logSearch(body.vibe, recommendation.id, body.userId);
    console.log("💾 Log saved successfully");

    return recommendation;
  } catch (error) {
    // 🔴 THIS LINE WILL TELL US THE TRUTH
    console.error("❌ CRITICAL ERROR IN AI CONTROLLER:", error.message);
    console.error(error.stack); 
    throw error;
  }
}
}
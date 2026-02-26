import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BadgeController } from './controller/badge.controller';
import { BadgeService } from './service/badge.service';
import { BadgeRepository } from './repository/badge.repository';
import { Badge, badgeSchema } from './schemas/badges.schema';

/**
 * Badge Module
 * Manages badge definitions and awards
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Badge.name, schema: badgeSchema }]),
  ],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeRepository],
  exports: [BadgeService], // Export for use in User module
})
export class BadgeModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './controller/ai.controller';
import { AiService } from './service/ai.service';
import { AiLog, AiLogSchema } from './schemas/ai-log.schema';
import { AiLogService } from './service/ai-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiLog.name, schema: AiLogSchema }])
  ],
  controllers: [AiController],
  providers: [AiService, AiLogService],
})
export class AiModule {}
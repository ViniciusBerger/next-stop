import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, eventSchema } from './schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: eventSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService], // Export for use in other modules (e.g., Review)
})
export class EventModule {}
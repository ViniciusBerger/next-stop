import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventRepository } from './repository/event.repository';
import { Event, eventSchema } from './schema/event.schema';

/**
 * Event Module
 * Manages events with RSVP and privacy controls
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: eventSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {}